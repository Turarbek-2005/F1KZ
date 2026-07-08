import Queue from 'bull';
import { logger } from '../utils/log';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Типы задач
export enum QueueJobType {
  GENERATE_AI_TEXT = 'generate_ai_text',
  GENERATE_AI_IMAGE = 'generate_ai_image',
  CACHE_TIMING_DATA = 'cache_timing_data',
}

export interface AITextJob {
  prompt: string;
  userId: string;
}

export interface AIImageJob {
  prompt: string;
  userId: string;
  saveToFile?: boolean;
}

// Очередь для AI задач
export const aiQueue = new Queue<AITextJob | AIImageJob>(
  'ai-tasks',
  redisUrl
);

// Очередь для кэширования
export const cacheQueue = new Queue(
  'cache-tasks',
  redisUrl
);

// Обработчики очередей
aiQueue.process(2, async (job) => {
  logger.info(`Processing AI job: ${job.id}`, { type: job.data });
  // Обработчики будут определены в сервисах
  return { processed: true };
});

cacheQueue.process(4, async (job) => {
  logger.info(`Processing cache job: ${job.id}`);
  return { cached: true };
});

// Event listeners
aiQueue.on('failed', (job, err) => {
  logger.error(`AI job ${job.id} failed:`, err);
});

cacheQueue.on('failed', (job, err) => {
  logger.error(`Cache job ${job.id} failed:`, err);
});

export async function disconnectQueues() {
  await aiQueue.close();
  await cacheQueue.close();
  logger.info('Queue connections closed');
}
