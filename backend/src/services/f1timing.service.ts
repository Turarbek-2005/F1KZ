import WebSocket from 'ws';
import axios from 'axios';
import { EventEmitter } from 'events';
import { logger } from '../utils/log';

const SIGNALR_BASE = 'https://livetiming.formula1.com/signalr';
const HUB = 'streaming';
const CONNECTION_DATA = JSON.stringify([{ name: HUB }]);

const TOPICS = [
  'Heartbeat',
  'ExtrapolatedClock',
  'TimingData',
  'TimingAppData',
  'SessionInfo',
  'TrackStatus',
  'WeatherData',
  'DriverList',
  'LapCount',
  'RaceControlMessages',
  'SessionStatus',
  'TimingStats',
];

function deepMerge(target: any, source: any): any {
  if (source === null || source === undefined) return target;
  if (typeof source !== 'object' || Array.isArray(source)) return source;
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = target?.[key];
    if (
      sv !== null &&
      typeof sv === 'object' &&
      !Array.isArray(sv) &&
      tv !== null &&
      typeof tv === 'object' &&
      !Array.isArray(tv)
    ) {
      result[key] = deepMerge(tv, sv);
    } else {
      result[key] = sv;
    }
  }
  return result;
}

export class F1TimingService extends EventEmitter {
  private ws: WebSocket | null = null;
  private state: Record<string, any> = {};
  private connectionToken = '';
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isConnecting = false;
  private msgId = 0;
  private hasReceivedSnapshot = false;
  private snapshotWaiters: Array<() => void> = [];

  // Returns a promise that resolves once the initial snapshot arrives,
  // or after `timeoutMs` even if nothing arrived. Triggers a connect if
  // the service isn't already connected. Required for Vercel serverless,
  // where there is no long-running process to call connect() at boot.
  async ensureConnected(timeoutMs = 4000): Promise<void> {
    if (this.hasReceivedSnapshot) return;
    if (!this.ws && !this.isConnecting) {
      this.connect().catch((err) =>
        logger.error(`[F1Timing] ensureConnected: ${err.message}`)
      );
    }
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        this.snapshotWaiters = this.snapshotWaiters.filter((w) => w !== done);
        resolve();
      }, timeoutMs);
      const done = () => {
        clearTimeout(timer);
        resolve();
      };
      this.snapshotWaiters.push(done);
    });
  }

  isReady(): boolean {
    return this.hasReceivedSnapshot;
  }

  async connect(): Promise<void> {
    if (this.isConnecting || this.ws) return;
    this.isConnecting = true;

    try {
      logger.info('[F1Timing] Negotiating with F1 Live Timing...');

      const { data: negotiation } = await axios.get(`${SIGNALR_BASE}/negotiate`, {
        params: {
          connectionData: CONNECTION_DATA,
          clientProtocol: '1.5',
          _: Date.now(),
        },
        headers: {
          'User-Agent': 'BestHTTP',
          'Accept-Encoding': 'gzip, identity',
          Referer: 'https://www.formula1.com/',
        },
        timeout: 10000,
      });

      this.connectionToken = negotiation.ConnectionToken;
      logger.info(`[F1Timing] Got connection token: ${this.connectionToken.slice(0, 20)}...`);

      const wsUrl = new URL(`${SIGNALR_BASE}/connect`);
      wsUrl.protocol = 'wss:';
      wsUrl.searchParams.set('transport', 'webSockets');
      wsUrl.searchParams.set('connectionToken', this.connectionToken);
      wsUrl.searchParams.set('connectionData', CONNECTION_DATA);
      wsUrl.searchParams.set('clientProtocol', '1.5');
      wsUrl.searchParams.set('_', String(Date.now()));

      this.ws = new WebSocket(wsUrl.toString(), {
        headers: {
          'User-Agent': 'BestHTTP',
          'Accept-Encoding': 'gzip, identity',
          Referer: 'https://www.formula1.com/',
        },
      });

      this.ws.on('open', () => {
        logger.info('[F1Timing] WebSocket connected, subscribing to topics...');
        this.isConnecting = false;

        this.ws!.send(
          JSON.stringify({
            H: HUB,
            M: 'Subscribe',
            A: [TOPICS],
            I: ++this.msgId,
          })
        );
      });

      this.ws.on('message', (raw: Buffer) => {
        try {
          const msg = JSON.parse(raw.toString());
          this.handleMessage(msg);
        } catch {
          // ignore unparseable frames
        }
      });

      this.ws.on('close', (code, reason) => {
        logger.warn(`[F1Timing] WS closed: ${code} ${reason.toString()}`);
        this.isConnecting = false;
        this.ws = null;
        this.scheduleReconnect();
      });

      this.ws.on('error', (err) => {
        logger.error(`[F1Timing] WS error: ${err.message}`);
        this.isConnecting = false;
        this.ws?.terminate();
        this.ws = null;
        this.scheduleReconnect();
      });
    } catch (err: any) {
      logger.error(`[F1Timing] Connection failed: ${err.message}`);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private handleMessage(msg: any) {
    // SignalR initial snapshot — arrives as msg.R after Subscribe
    if (msg.R && typeof msg.R === 'object') {
      for (const [topic, data] of Object.entries(msg.R)) {
        this.state[topic] = data;
      }
      logger.info('[F1Timing] Got initial snapshot');
      this.hasReceivedSnapshot = true;
      const waiters = this.snapshotWaiters;
      this.snapshotWaiters = [];
      waiters.forEach((w) => w());
      this.emit('snapshot', this.state);
    }

    // Incremental feed messages
    if (Array.isArray(msg.M)) {
      for (const m of msg.M) {
        if (m.H === HUB && m.M === 'feed' && Array.isArray(m.A) && m.A.length >= 2) {
          const [topic, data, timestamp] = m.A as [string, any, string];
          this.state[topic] = deepMerge(this.state[topic] ?? {}, data);
          this.emit('update', { topic, data, timestamp });
        }
      }
    }
  }

  private scheduleReconnect() {
    // Only auto-reconnect for the persistent singleton, not one-shot instances
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      logger.info('[F1Timing] Reconnecting...');
      this.connect();
    }, 5000);
  }

  disableReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    // Replace scheduleReconnect with a no-op so the closed-socket handler
    // doesn't start retrying after a deliberate one-shot disconnect.
    (this as any).scheduleReconnect = () => {};
  }

  getState(): Record<string, any> {
    return this.state;
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.terminate();
    this.ws = null;
  }
}

// Singleton used by the persistent server process (local / traditional hosting)
export const f1TimingService = new F1TimingService();

/**
 * One-shot fetch for serverless environments (Vercel).
 * Opens a SignalR connection, waits for the initial snapshot, then closes.
 * The snapshot usually arrives within 1-3 s after subscribing.
 */
export async function fetchF1Snapshot(
  timeoutMs = 12000
): Promise<Record<string, any>> {
  return new Promise((resolve) => {
    const svc = new F1TimingService();
    svc.disableReconnect();

    const done = (state: Record<string, any>) => {
      clearTimeout(timer);
      svc.disconnect();
      resolve(state);
    };

    const timer = setTimeout(() => {
      logger.warn('[F1Timing] One-shot snapshot timed out');
      done({});
    }, timeoutMs);

    svc.once('snapshot', (state) => done(state));

    svc.connect().catch((err) => {
      logger.error(`[F1Timing] One-shot connect failed: ${err.message}`);
      done({});
    });
  });
}
