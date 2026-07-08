import Redis from 'ioredis';
import { logger } from './utils/log';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_DEBUG = process.env.REDIS_DEBUG === 'true';

export const redis = new Redis(redisUrl, {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  enableOfflineQueue: true,
});

redis.on('connect', () => {
  logger.info('✅ Redis connected');
});

redis.on('ready', () => {
  logger.info('🟢 Redis ready for commands');
});

redis.on('error', (err) => {
  logger.error('❌ Redis connection error:', { 
    message: err.message,
    code: (err as any).code,
  });
});

redis.on('close', () => {
  logger.warn('🔴 Redis connection closed');
});

redis.on('reconnecting', () => {
  logger.info('🔄 Redis reconnecting...');
});

// Перехватываем все Redis команды для логирования
if (REDIS_DEBUG) {
  redis.on('ready', () => {
    logger.debug('Redis DEBUG mode enabled - all commands will be logged');
  });
}

export async function disconnectRedis() {
  await redis.quit();
  logger.info('✅ Redis disconnected gracefully');
}

export { REDIS_DEBUG };
