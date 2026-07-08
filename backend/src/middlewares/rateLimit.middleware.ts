import { Request, Response, NextFunction } from 'express';
import { redis } from '../redis';
import { logger } from '../utils/log';
import type { AuthRequest } from '../types/auth';

interface RateLimitOptions {
  windowMs: number; // временное окно в миллисекундах
  maxRequests: number; // максимум запросов в окне
  keyPrefix?: string;
}

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyPrefix = 'ratelimit' } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    const identifier = authReq.user?.id || req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const key = `${keyPrefix}:${identifier}`;

    try {
      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, Math.ceil(windowMs / 1000));
      }

      const remaining = maxRequests - current;
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining));

      logger.debug('🔄 [RateLimit]', {
        endpoint: req.path,
        identifier,
        current,
        limit: maxRequests,
        remaining: Math.max(0, remaining),
        key,
      });

      if (current > maxRequests) {
        logger.warn('⚠️ [RateLimit] Limit exceeded', {
          endpoint: req.path,
          identifier,
          current,
          limit: maxRequests,
          key,
        });
        return res.status(429).json({
          message: 'Too many requests, please try again later',
          retryAfter: Math.ceil(windowMs / 1000),
        });
      }

      next();
    } catch (err) {
      logger.error('❌ [RateLimit] Error checking rate limit:', {
        error: err instanceof Error ? err.message : String(err),
        endpoint: req.path,
        identifier,
        key,
      });
      // Если Redis недоступен, пропускаем rate limit
      next();
    }
  };
}

// Предустановки для разных API endpoints
export const rateLimiters = {
  ai: createRateLimiter({
    windowMs: 60 * 1000, // 1 минута
    maxRequests: 10,
    keyPrefix: 'ratelimit:ai',
  }),
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 минут
    maxRequests: 5,
    keyPrefix: 'ratelimit:auth',
  }),
  api: createRateLimiter({
    windowMs: 60 * 1000, // 1 минута
    maxRequests: 100,
    keyPrefix: 'ratelimit:api',
  }),
};
