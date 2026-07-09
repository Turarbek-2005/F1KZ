import axios from 'axios';
import { EventEmitter } from 'events';
import { logger } from '../utils/log';
import { redis } from '../redis';

const OPENF1_BASE = 'https://api.openf1.org/v1';
const SNAPSHOT_KEY = 'f1:openf1:snapshot';
const SNAPSHOT_TTL = 3600; // 1 hour

// Adaptive polling: OpenF1 is aggressively rate-limited, and outside of a live
// session the data barely changes, so we back right off when nothing is live.
const POLL_LIVE_MS = 10000; // active session
const POLL_IDLE_MS = 60000; // no active/finished session

// Minimum spacing between consecutive OpenF1 HTTP calls. All requests funnel
// through a single queue so a burst of parallel calls can't trip the per-second
// rate limit (which was returning 429s).
const REQUEST_SPACING_MS = 500;

// Slow-changing data (session/meeting/drivers) is refetched at most this often.
const STATIC_TTL_MS = 60000;

// On a 429 we grow the effective poll interval up to this ceiling.
const MAX_BACKOFF_MS = 120000;

// How long after a session ends we still surface it as "Finished" before
// treating the weekend as over (Inactive). Keeps a stale latest session from
// looking live forever once the OpenF1 feed stops updating.
const FINISHED_WINDOW_MS = 2 * 60 * 60 * 1000;

type Row = Record<string, any>;
type State = Record<string, any>;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// Signals to callers that OpenF1 asked us to slow down.
class RateLimitError extends Error {
  constructor(public retryAfterMs: number) {
    super('OpenF1 rate limited (429)');
  }
}

// Global serialized request queue. Every OpenF1 call waits its turn and is
// spaced by REQUEST_SPACING_MS, so even a Promise.all of eight endpoints goes
// out one-at-a-time rather than as a burst.
let queueTail: Promise<unknown> = Promise.resolve();
let nextAllowedAt = 0;

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = async (): Promise<T> => {
    const wait = nextAllowedAt - Date.now();
    if (wait > 0) await sleep(wait);
    nextAllowedAt = Date.now() + REQUEST_SPACING_MS;
    return fn();
  };
  const result = queueTail.then(run, run);
  queueTail = result.then(
    () => undefined,
    () => undefined
  );
  return result;
}

async function getJson(path: string): Promise<Row[]> {
  const url = `${OPENF1_BASE}${path}`;
  return enqueue(async () => {
    try {
      const { data } = await axios.get(url, {
        timeout: 10000,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'F1KZ/1.0 (+live-timing)',
        },
      });
      return Array.isArray(data) ? data : [];
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 429) {
        const retryAfter = Number(err?.response?.headers?.['retry-after']);
        const retryAfterMs =
          Number.isFinite(retryAfter) && retryAfter > 0
            ? retryAfter * 1000
            : REQUEST_SPACING_MS * 4;
        // Push the whole queue back so pending calls don't pile straight into
        // another 429.
        nextAllowedAt = Math.max(nextAllowedAt, Date.now() + retryAfterMs);
        throw new RateLimitError(retryAfterMs);
      }
      logger.warn(`[OpenF1] Request failed: ${path} — ${err?.message ?? err}`);
      return [];
    }
  });
}

function formatLapTime(seconds?: number | null): string | undefined {
  if (seconds == null || !isFinite(seconds)) return undefined;
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  const sStr = s.toFixed(3).padStart(6, '0'); // "02.478"
  return m > 0 ? `${m}:${sStr}` : s.toFixed(3);
}

function formatGap(v: unknown): string | undefined {
  if (v == null) return undefined;
  if (typeof v === 'string') return v; // e.g. "+1 LAP"
  if (typeof v === 'number') return `+${v.toFixed(3)}`;
  return undefined;
}

function toMs(date?: string | null): number {
  if (!date) return 0;
  const t = Date.parse(date);
  return isNaN(t) ? 0 : t;
}

// Reduce a list of rows to the most recent row per driver (by `date`).
function latestPerDriver(rows: Row[]): Map<number, Row> {
  const map = new Map<number, Row>();
  for (const row of rows) {
    const num = row.driver_number;
    if (num == null) continue;
    const prev = map.get(num);
    if (!prev || toMs(row.date) >= toMs(prev.date)) {
      map.set(num, row);
    }
  }
  return map;
}

const FLAG_TO_TRACK_STATUS: Record<string, { Status: string; Message: string }> = {
  GREEN: { Status: '1', Message: 'AllClear' },
  CLEAR: { Status: '1', Message: 'AllClear' },
  YELLOW: { Status: '2', Message: 'Yellow' },
  'DOUBLE YELLOW': { Status: '2', Message: 'Yellow' },
  RED: { Status: '5', Message: 'Red' },
  CHEQUERED: { Status: '1', Message: 'Chequered' },
};

// Derive a SignalR-style TrackStatus from the latest relevant race-control entry.
function deriveTrackStatus(raceControl: Row[]): State | undefined {
  const sorted = [...raceControl].sort((a, b) => toMs(b.date) - toMs(a.date));
  for (const m of sorted) {
    const category = String(m.category ?? '');
    const flag = String(m.flag ?? '').toUpperCase();
    const message = String(m.message ?? '');

    if (category === 'SafetyCar') {
      const isVirtual = /VIRTUAL/i.test(message) || /VSC/i.test(message);
      if (/ENDING|CLEAR/i.test(message)) {
        return isVirtual
          ? { Status: '7', Message: 'VSCEnding' }
          : { Status: '1', Message: 'AllClear' };
      }
      return isVirtual
        ? { Status: '6', Message: 'VirtualSafetyCar' }
        : { Status: '4', Message: 'SafetyCar' };
    }

    if (flag && FLAG_TO_TRACK_STATUS[flag]) {
      return FLAG_TO_TRACK_STATUS[flag];
    }
  }
  return { Status: '1', Message: 'AllClear' };
}

function deriveSessionStatus(session?: Row): State {
  if (!session) return { Status: 'Inactive' };
  const now = Date.now();
  const start = toMs(session.date_start);
  const end = toMs(session.date_end);
  if (start && now < start) return { Status: 'Inactive' };
  if (start && end && now >= start && now <= end) return { Status: 'Started' };
  if (end && now > end && now <= end + FINISHED_WINDOW_MS) {
    return { Status: 'Finished' };
  }
  return { Status: 'Inactive' };
}

function buildSessionInfo(session?: Row, meeting?: Row): State | undefined {
  if (!session && !meeting) return undefined;
  return {
    Key: session?.session_key,
    Type: session?.session_type,
    Name: session?.session_name,
    StartDate: session?.date_start,
    EndDate: session?.date_end,
    GmtOffset: session?.gmt_offset,
    Meeting: meeting
      ? {
          Key: meeting.meeting_key,
          Name: meeting.meeting_name,
          OfficialName: meeting.meeting_official_name,
          Location: meeting.location,
          Country: {
            Code: meeting.country_code,
            Key: meeting.country_key,
            Name: meeting.country_name,
          },
          Circuit: {
            Key: meeting.circuit_key,
            ShortName: meeting.circuit_short_name,
          },
        }
      : undefined,
  };
}

function buildDriverList(drivers: Row[]): State {
  const list: State = {};
  for (const d of drivers) {
    const num = String(d.driver_number);
    list[num] = {
      RacingNumber: num,
      BroadcastName: d.broadcast_name,
      FullName: d.full_name,
      Tla: d.name_acronym,
      TeamName: d.team_name,
      TeamColour: d.team_colour, // OpenF1 gives hex without '#'
      FirstName: d.first_name,
      LastName: d.last_name,
      HeadshotUrl: d.headshot_url,
    };
  }
  return list;
}

function buildTimingData(
  drivers: Row[],
  positions: Row[],
  intervals: Row[],
  laps: Row[]
): State {
  const posMap = latestPerDriver(positions);
  const intMap = latestPerDriver(intervals);

  // Group laps per driver
  const lapsByDriver = new Map<number, Row[]>();
  for (const lap of laps) {
    const num = lap.driver_number;
    if (num == null) continue;
    if (!lapsByDriver.has(num)) lapsByDriver.set(num, []);
    lapsByDriver.get(num)!.push(lap);
  }

  // Overall fastest lap across the session (for OverallFastest badge)
  let overallBest = Infinity;
  for (const lap of laps) {
    if (typeof lap.lap_duration === 'number' && lap.lap_duration < overallBest) {
      overallBest = lap.lap_duration;
    }
  }

  const lines: State = {};

  for (const d of drivers) {
    const num = d.driver_number;
    const key = String(num);
    const pos = posMap.get(num)?.position;
    const interval = intMap.get(num);

    const driverLaps = (lapsByDriver.get(num) ?? []).filter(
      (l) => typeof l.lap_duration === 'number'
    );
    driverLaps.sort((a, b) => (a.lap_number ?? 0) - (b.lap_number ?? 0));

    const lastLap = driverLaps[driverLaps.length - 1];
    let bestLap: Row | undefined;
    for (const l of driverLaps) {
      if (!bestLap || l.lap_duration < bestLap.lap_duration) bestLap = l;
    }

    const maxLapNumber = (lapsByDriver.get(num) ?? []).reduce(
      (max, l) => Math.max(max, l.lap_number ?? 0),
      0
    );

    const gapToLeader = formatGap(interval?.gap_to_leader);
    const intervalAhead = formatGap(interval?.interval);

    lines[key] = {
      Line: pos,
      Position: pos != null ? String(pos) : undefined,
      RacingNumber: key,
      GapToLeader: gapToLeader,
      IntervalToPositionAhead: intervalAhead
        ? { Value: intervalAhead }
        : undefined,
      LastLapTime: lastLap
        ? {
            Value: formatLapTime(lastLap.lap_duration),
            OverallFastest: lastLap.lap_duration === overallBest,
            PersonalFastest:
              bestLap != null && lastLap.lap_duration === bestLap.lap_duration,
          }
        : undefined,
      BestLapTime: bestLap
        ? {
            Value: formatLapTime(bestLap.lap_duration),
            Lap: bestLap.lap_number,
          }
        : undefined,
      NumberOfLaps: maxLapNumber || undefined,
      PitOut: lastLap?.is_pit_out_lap === true,
    };
  }

  return { Lines: lines };
}

function buildTimingAppData(stints: Row[]): State {
  const byDriver = new Map<number, Row[]>();
  for (const s of stints) {
    const num = s.driver_number;
    if (num == null) continue;
    if (!byDriver.has(num)) byDriver.set(num, []);
    byDriver.get(num)!.push(s);
  }

  const lines: State = {};
  for (const [num, list] of byDriver) {
    list.sort((a, b) => (a.stint_number ?? 0) - (b.stint_number ?? 0));
    const stintMap: State = {};
    for (const s of list) {
      const totalLaps =
        s.lap_end != null && s.lap_start != null
          ? s.lap_end - s.lap_start + 1
          : undefined;
      stintMap[String(s.stint_number ?? Object.keys(stintMap).length + 1)] = {
        Compound: s.compound ? String(s.compound).toUpperCase() : undefined,
        New: s.tyre_age_at_start === 0,
        TotalLaps: totalLaps,
        StartLaps: s.tyre_age_at_start,
      };
    }
    lines[String(num)] = { RacingNumber: String(num), Stints: stintMap };
  }

  return { Lines: lines };
}

function buildWeather(weather: Row[]): State | undefined {
  if (weather.length === 0) return undefined;
  const latest = weather.reduce((a, b) => (toMs(b.date) >= toMs(a.date) ? b : a));
  const val = (v: unknown) => (v == null ? undefined : String(v));
  return {
    AirTemp: val(latest.air_temperature),
    Humidity: val(latest.humidity),
    Pressure: val(latest.pressure),
    Rainfall: latest.rainfall === 1 || latest.rainfall === true,
    TrackTemp: val(latest.track_temperature),
    WindDirection: val(latest.wind_direction),
    WindSpeed: val(latest.wind_speed),
  };
}

function buildRaceControl(raceControl: Row[]): State {
  const sorted = [...raceControl].sort((a, b) => toMs(a.date) - toMs(b.date));
  const messages: State = {};
  sorted.forEach((m, i) => {
    messages[String(i + 1)] = {
      Utc: m.date,
      Lap: m.lap_number,
      Category: m.category,
      Flag: m.flag ? String(m.flag).toUpperCase() : undefined,
      Message: m.message,
      Scope: m.scope,
      Sector: m.sector,
      RacingNumber: m.driver_number != null ? String(m.driver_number) : undefined,
    };
  });
  return { Messages: messages };
}

function buildLapCount(laps: Row[]): State | undefined {
  if (laps.length === 0) return undefined;
  const current = laps.reduce((max, l) => Math.max(max, l.lap_number ?? 0), 0);
  if (!current) return undefined;
  return { CurrentLap: current };
}

interface StaticData {
  session: Row | undefined;
  meeting: Row | undefined;
  drivers: Row[];
}

// Slow-changing endpoints: session, meeting, driver list.
async function fetchStatic(): Promise<StaticData> {
  const [session] = await getJson('/sessions?session_key=latest');
  if (!session) return { session: undefined, meeting: undefined, drivers: [] };
  const [meetingRows, drivers] = [
    await getJson('/meetings?meeting_key=latest'),
    await getJson('/drivers?session_key=latest'),
  ];
  return { session, meeting: meetingRows[0], drivers };
}

interface DynamicData {
  positions: Row[];
  intervals: Row[];
  laps: Row[];
  stints: Row[];
  weather: Row[];
  raceControl: Row[];
}

// Fast-changing endpoints. Fetched sequentially (through the shared queue) so a
// 429 aborts the cycle early instead of firing every remaining request.
async function fetchDynamic(): Promise<DynamicData> {
  // Bound the size of the high-frequency intervals feed to a recent window.
  const recentIso = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const positions = await getJson('/position?session_key=latest');
  const intervals = await getJson(
    `/intervals?session_key=latest&date>=${recentIso}`
  );
  const laps = await getJson('/laps?session_key=latest');
  const stints = await getJson('/stints?session_key=latest');
  const weather = await getJson('/weather?session_key=latest');
  const raceControl = await getJson('/race_control?session_key=latest');
  return { positions, intervals, laps, stints, weather, raceControl };
}

function assemble(stat: StaticData, dyn: DynamicData): State {
  return {
    Heartbeat: { Utc: new Date().toISOString() },
    SessionInfo: buildSessionInfo(stat.session, stat.meeting),
    SessionStatus: deriveSessionStatus(stat.session),
    TrackStatus: deriveTrackStatus(dyn.raceControl),
    DriverList: buildDriverList(stat.drivers),
    TimingData: buildTimingData(
      stat.drivers,
      dyn.positions,
      dyn.intervals,
      dyn.laps
    ),
    TimingAppData: buildTimingAppData(dyn.stints),
    WeatherData: buildWeather(dyn.weather),
    LapCount: buildLapCount(dyn.laps),
    RaceControlMessages: buildRaceControl(dyn.raceControl),
  };
}

// One-shot build (serverless / cold start): fetch everything once.
async function assembleState(): Promise<State> {
  const stat = await fetchStatic();
  if (!stat.session) return {};
  const dyn = await fetchDynamic();
  return assemble(stat, dyn);
}

export class OpenF1LiveService extends EventEmitter {
  private state: State = {};
  private pollTimer: ReturnType<typeof setTimeout> | null = null;
  private stopped = true;
  private hasSnapshot = false;
  private inFlight: Promise<void> | null = null;

  // Cached slow-changing data + when it was fetched.
  private staticCache: StaticData | null = null;
  private staticAt = 0;

  // Grows on repeated 429s to lengthen the poll interval, resets on success.
  private backoffMs = 0;

  isReady(): boolean {
    return this.hasSnapshot;
  }

  getState(): State {
    return this.state;
  }

  // Start the persistent, self-scheduling polling loop (traditional server).
  connect(): void {
    if (!this.stopped) return;
    this.stopped = false;
    void this.loop();
  }

  disconnect(): void {
    this.stopped = true;
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
  }

  // Ensure at least one snapshot has been built. Used on serverless where
  // there is no boot-time connect(). Resolves after `timeoutMs` regardless.
  async ensureConnected(timeoutMs = 8000): Promise<void> {
    if (this.hasSnapshot) return;
    await Promise.race([
      this.refresh(),
      new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
    ]);
  }

  private async loop(): Promise<void> {
    if (this.stopped) return;
    await this.refresh();
    if (this.stopped) return;

    const status = this.state.SessionStatus?.Status;
    const base = status === 'Started' ? POLL_LIVE_MS : POLL_IDLE_MS;
    const delay = Math.min(Math.max(base, this.backoffMs), MAX_BACKOFF_MS);
    this.pollTimer = setTimeout(() => void this.loop(), delay);
  }

  private async getStatic(): Promise<StaticData> {
    const fresh =
      this.staticCache &&
      this.staticCache.session &&
      Date.now() - this.staticAt < STATIC_TTL_MS;
    if (fresh) return this.staticCache!;

    const stat = await fetchStatic();
    // Keep the previous static data if the refetch turned up nothing.
    if (stat.session) {
      this.staticCache = stat;
      this.staticAt = Date.now();
      return stat;
    }
    return this.staticCache ?? stat;
  }

  private async refresh(): Promise<void> {
    if (this.inFlight) return this.inFlight;
    this.inFlight = (async () => {
      try {
        const stat = await this.getStatic();
        if (!stat.session) return; // nothing to build yet

        const dyn = await fetchDynamic();
        this.state = assemble(stat, dyn);
        this.hasSnapshot = true;
        this.backoffMs = 0; // recovered
        this.emit('snapshot', this.state);
        void redis
          .setex(SNAPSHOT_KEY, SNAPSHOT_TTL, JSON.stringify(this.state))
          .catch(() => {});
      } catch (err: any) {
        if (err instanceof RateLimitError) {
          this.backoffMs = Math.min(
            Math.max(this.backoffMs * 2, POLL_LIVE_MS, err.retryAfterMs),
            MAX_BACKOFF_MS
          );
          logger.warn(
            `[OpenF1] Rate limited — backing off to ${Math.round(
              this.backoffMs / 1000
            )}s`
          );
        } else {
          logger.error(`[OpenF1] refresh failed: ${err?.message ?? err}`);
        }
      } finally {
        this.inFlight = null;
      }
    })();
    return this.inFlight;
  }

  async getCachedState(): Promise<State | null> {
    try {
      const cached = await redis.get(SNAPSHOT_KEY);
      return cached ? (JSON.parse(cached) as State) : null;
    } catch {
      return null;
    }
  }
}

// Singleton used by the persistent server process.
export const openF1LiveService = new OpenF1LiveService();

/**
 * One-shot snapshot for serverless environments (Vercel).
 * Builds the state once and falls back to the Redis cache if OpenF1 is empty
 * or rate-limited.
 */
export async function fetchOpenF1Snapshot(): Promise<State> {
  try {
    const state = await assembleState();
    if (Object.keys(state).length > 0) {
      void redis
        .setex(SNAPSHOT_KEY, SNAPSHOT_TTL, JSON.stringify(state))
        .catch(() => {});
      return state;
    }
  } catch (err: any) {
    if (err instanceof RateLimitError) {
      logger.warn('[OpenF1] one-shot snapshot rate limited — using cache');
    } else {
      logger.error(`[OpenF1] one-shot snapshot failed: ${err?.message ?? err}`);
    }
  }

  try {
    const cached = await redis.get(SNAPSHOT_KEY);
    if (cached) return JSON.parse(cached) as State;
  } catch {
    // ignore
  }
  return {};
}
