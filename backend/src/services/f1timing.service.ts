import WebSocket from 'ws';
import axios from 'axios';
import { EventEmitter } from 'events';
import { logger } from '../utils/log';
import { redis } from '../redis';

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
  private isBlocked = false;

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

  private getErrorStatus(err: any): number | null {
    if (typeof err?.response?.status === 'number') return err.response.status;
    if (typeof err?.status === 'number') return err.status;

    const match = String(err?.message ?? '').match(/status code (\d{3})/i);
    if (match) return Number(match[1]);
    return null;
  }

  async connect(): Promise<void> {
    if (this.isConnecting || this.ws) return;
    if (this.isBlocked) {
      logger.warn('[F1Timing] Connection is blocked after a previous auth failure.');
      return;
    }

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
        logger.info('[F1Timing] WebSocket connected, subscribing to topics...', {
          topicsCount: TOPICS.length,
          topics: TOPICS,
        });
        this.isConnecting = false;

        const subscribeMsg = {
          H: HUB,
          M: 'Subscribe',
          A: [TOPICS],
          I: ++this.msgId,
        };
        logger.debug('[F1Timing] Sending subscribe message:', {
          message: subscribeMsg,
        });
        this.ws!.send(JSON.stringify(subscribeMsg));
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
      const statusCode = this.getErrorStatus(err);
      const authHeader = err?.response?.headers?.['www-authenticate'] || err?.response?.headers?.['WWW-Authenticate'];
      if (statusCode === 401 || statusCode === 403) {
        this.isBlocked = true;
        this.isConnecting = false;
        logger.warn(`[F1Timing] Live timing endpoint rejected the connection (${statusCode}). Disabling further reconnect attempts.`, {
          statusCode,
          url: err?.config?.url,
          authHeader,
        });
        return;
      }

      logger.error(`[F1Timing] Connection failed: ${err.message}`, {
        statusCode,
        url: err?.config?.url,
        authHeader,
      });
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private handleMessage(msg: any) {
    // Debug: логируем все сообщения которые приходят
    logger.debug('📬 [F1Timing] Raw message received:', {
      messageKeys: Object.keys(msg),
      hasR: !!msg.R,
      hasM: !!msg.M,
      rType: typeof msg.R,
      mIsArray: Array.isArray(msg.M),
      rLength: msg.R ? Object.keys(msg.R).length : 0,
      mLength: Array.isArray(msg.M) ? msg.M.length : 0,
    });

    // SignalR initial snapshot — arrives as msg.R after Subscribe
    if (msg.R && typeof msg.R === 'object') {
      const rKeys = Object.keys(msg.R);
      logger.info('[F1Timing] Got initial snapshot', {
        topicsReceived: rKeys,
        topicCount: rKeys.length,
        isEmpty: rKeys.length === 0,
        fullSnapshot: JSON.stringify(msg.R).substring(0, 500), // First 500 chars
      });

      for (const [topic, data] of Object.entries(msg.R)) {
        this.state[topic] = data;
        logger.debug('📥 [F1Timing] Snapshot topic loaded:', {
          topic,
          dataType: typeof data,
          hasData: !!data,
          dataKeys: typeof data === 'object' && data !== null ? Object.keys(data).length : 'N/A',
          dataPreview: JSON.stringify(data).substring(0, 200),
        });
      }
      logger.info('[F1Timing] Got initial snapshot');
      this.hasReceivedSnapshot = true;
      
      // Кэшируем snapshot в Redis на 1 час
      const snapshotJson = JSON.stringify(this.state);
      const snapshotSize = Buffer.byteLength(snapshotJson, 'utf-8');
      redis.setex('f1:timing:snapshot', 3600, snapshotJson)
        .then(() => {
          logger.info('📥 [F1Timing] Cached snapshot to Redis', {
            key: 'f1:timing:snapshot',
            size: `${(snapshotSize / 1024).toFixed(2)} KB`,
            ttl: '1 hour',
            topicCount: Object.keys(this.state).length,
          });
        })
        .catch((err: any) => logger.error('[F1Timing] Failed to cache snapshot:', {
          error: err instanceof Error ? err.message : String(err),
          key: 'f1:timing:snapshot',
        }));
      
      const waiters = this.snapshotWaiters;
      this.snapshotWaiters = [];
      waiters.forEach((w) => w());
      this.emit('snapshot', this.state);
    }

    // Incremental feed messages
    if (Array.isArray(msg.M)) {
      logger.debug('📬 [F1Timing] Feed messages batch received', {
        messageCount: msg.M.length,
      });

      for (const m of msg.M) {
        if (m.H === HUB && m.M === 'feed' && Array.isArray(m.A) && m.A.length >= 2) {
          const [topic, data, timestamp] = m.A as [string, any, string];
          logger.debug('📥 [F1Timing] Feed update received:', {
            topic,
            timestamp,
            dataType: typeof data,
            dataKeys: typeof data === 'object' ? Object.keys(data).length : 'N/A',
          });

          this.state[topic] = deepMerge(this.state[topic] ?? {}, data);
          
          // Кэшируем отдельные topic обновления для быстрого доступа
          const topicJson = JSON.stringify(this.state[topic]);
          const topicSize = Buffer.byteLength(topicJson, 'utf-8');
          const topicKey = `f1:timing:topic:${topic}`;
          
          redis.setex(topicKey, 300, topicJson)
            .then(() => {
              logger.debug('📥 [F1Timing] Cached topic update to Redis', {
                key: topicKey,
                size: `${(topicSize / 1024).toFixed(2)} KB`,
                ttl: '5 min',
                timestamp,
              });
            })
            .catch((err: any) => logger.error(`[F1Timing] Failed to cache topic ${topic}:`, {
              error: err instanceof Error ? err.message : String(err),
              key: topicKey,
            }));
          
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

  async getCachedState(): Promise<Record<string, any> | null> {
    try {
      const cached = await redis.get('f1:timing:snapshot');
      if (cached) {
        const state = JSON.parse(cached);
        const size = Buffer.byteLength(cached, 'utf-8');
        logger.debug('📤 [F1Timing] Retrieved snapshot from Redis cache', {
          key: 'f1:timing:snapshot',
          size: `${(size / 1024).toFixed(2)} KB`,
          topicCount: Object.keys(state).length,
        });
        return state;
      } else {
        logger.debug('⚠️ [F1Timing] Snapshot not found in Redis cache');
        return null;
      }
    } catch (err) {
      logger.error('[F1Timing] Failed to get cached state:', {
        error: err instanceof Error ? err.message : String(err),
        key: 'f1:timing:snapshot',
      });
      return null;
    }
  }

  async getCachedTopic(topic: string): Promise<any | null> {
    try {
      const key = `f1:timing:topic:${topic}`;
      const cached = await redis.get(key);
      if (cached) {
        const data = JSON.parse(cached);
        const size = Buffer.byteLength(cached, 'utf-8');
        logger.debug('📤 [F1Timing] Retrieved topic from Redis cache', {
          key,
          size: `${(size / 1024).toFixed(2)} KB`,
        });
        return data;
      } else {
        logger.debug('⚠️ [F1Timing] Topic not found in Redis cache', { key });
        return null;
      }
    } catch (err) {
      logger.error(`[F1Timing] Failed to get cached topic ${topic}:`, {
        error: err instanceof Error ? err.message : String(err),
        key: `f1:timing:topic:${topic}`,
      });
      return null;
    }
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

    const done = async (state: Record<string, any>) => {
      clearTimeout(timer);

      if (Object.keys(state).length === 0) {
        const cached = await svc.getCachedState();
        if (cached && Object.keys(cached).length > 0) {
          logger.info('[F1Timing] Returning cached snapshot for one-shot fetch');
          state = cached;
        }
      }

      svc.disconnect();
      resolve(state);
    };

    const timer = setTimeout(() => {
      logger.warn('[F1Timing] One-shot snapshot timed out');
      void done({});
    }, timeoutMs);

    svc.once('snapshot', (state) => {
      void done(state);
    });

    svc.connect().catch((err) => {
      logger.error(`[F1Timing] One-shot connect failed: ${err.message}`);
      void done({});
    });
  });
}
