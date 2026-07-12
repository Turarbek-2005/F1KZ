import axios from "axios";
import { prisma } from "../prisma";
import { logger } from "../utils/log";

// Talks to the same external F1 API the f1api routes proxy, but server-side so
// prediction scores are computed here and can't be forged by a client.
const f1ApiClient = axios.create({
  baseURL: "https://f1api.dev/api/",
  timeout: 10000,
});

const CACHE_TTL_MS = 5 * 60 * 1000;

export interface NextRaceInfo {
  raceId: string;
  round: string;
  raceName: string;
  /** Epoch ms of race start when the API provides it; predictions close then. */
  startsAt: number | null;
}

interface Podium {
  p1: string;
  p2: string;
  p3: string;
}

let nextRaceCache: { value: NextRaceInfo | null; ts: number } | null = null;
let settleCache: { promise: Promise<void>; ts: number } | null = null;

function parseRaceStart(schedule: any): number | null {
  const date = schedule?.race?.date;
  if (!date) return null;
  const time = schedule?.race?.time ?? "00:00:00Z";
  const ms = Date.parse(`${date}T${time}`);
  return Number.isNaN(ms) ? null : ms;
}

export async function getNextRace(): Promise<NextRaceInfo | null> {
  if (nextRaceCache && Date.now() - nextRaceCache.ts < CACHE_TTL_MS) {
    return nextRaceCache.value;
  }

  try {
    const { data } = await f1ApiClient.get("current/next");
    const race = data?.race?.[0];
    const value: NextRaceInfo | null = race?.raceId
      ? {
          raceId: String(race.raceId),
          round: String(data?.round ?? ""),
          raceName: String(race.raceName ?? ""),
          startsAt: parseRaceStart(race.schedule),
        }
      : null;
    nextRaceCache = { value, ts: Date.now() };
    return value;
  } catch (error) {
    logger.error("getNextRace failed:", error);
    // Keep serving the stale value rather than blocking saves entirely.
    return nextRaceCache?.value ?? null;
  }
}

export function scorePrediction(
  p: { p1: string; p2: string; p3: string },
  actual: Podium
): number {
  let pts = 0;
  // 5 points for exact position match
  if (p.p1 === actual.p1) pts += 5;
  if (p.p2 === actual.p2) pts += 5;
  if (p.p3 === actual.p3) pts += 5;
  // 1 point bonus if guessed driver is on podium (any other position)
  const guessed = [p.p1, p.p2, p.p3];
  const podium = [actual.p1, actual.p2, actual.p3];
  guessed.forEach((g, i) => {
    if (g && podium.includes(g) && podium[i] !== g) pts += 1;
  });
  return pts;
}

// Scores every stored prediction for the most recently finished race. Called
// lazily before leaderboard / prediction reads; throttled so bursts of
// requests don't hammer the external API or the DB.
export function settleFinishedPredictions(): Promise<void> {
  if (settleCache && Date.now() - settleCache.ts < CACHE_TTL_MS) {
    return settleCache.promise;
  }

  const promise = doSettle().catch((error) => {
    logger.error("settleFinishedPredictions failed:", error);
  });
  settleCache = { promise, ts: Date.now() };
  return promise;
}

async function doSettle(): Promise<void> {
  const [metaRes, resultRes] = await Promise.all([
    f1ApiClient.get("current/last"),
    f1ApiClient.get("current/last/race"),
  ]);

  const raceId = metaRes.data?.race?.[0]?.raceId;
  const results: any[] = resultRes.data?.races?.results ?? [];
  if (!raceId || results.length < 3) return;

  const sorted = results
    .slice()
    .sort((a, b) => (a.position ?? 99) - (b.position ?? 99));
  const actual: Podium = {
    p1: sorted[0]?.driver?.driverId,
    p2: sorted[1]?.driver?.driverId,
    p3: sorted[2]?.driver?.driverId,
  };
  if (!actual.p1 || !actual.p2 || !actual.p3) return;

  const unscored = await prisma.prediction.findMany({
    where: { raceId: String(raceId), score: null },
  });
  if (unscored.length === 0) return;

  await prisma.$transaction(
    unscored.map((p) =>
      prisma.prediction.update({
        where: { id: p.id },
        data: {
          score: scorePrediction(p, actual),
          actualP1: actual.p1,
          actualP2: actual.p2,
          actualP3: actual.p3,
        },
      })
    )
  );
  logger.info(
    `Settled ${unscored.length} prediction(s) for race ${raceId}`
  );
}
