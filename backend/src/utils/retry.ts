import { logger } from "./log";

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Retry wrapper for async operations with exponential backoff
 * Useful for handling transient Supabase connection issues
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 100,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      const isTransient =
        lastError.message.includes("too many connections") ||
        lastError.message.includes("ECONNREFUSED") ||
        lastError.message.includes("ETIMEDOUT") ||
        lastError.message.includes("connection") ||
        lastError.message.includes("timeout");

      if (attempt === maxAttempts || !isTransient) {
        throw error;
      }

      const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);

      onRetry?.(attempt, lastError);
      logger.warn(
        `[Retry] Attempt ${attempt}/${maxAttempts} failed, retrying in ${delay}ms: ${lastError.message}`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
