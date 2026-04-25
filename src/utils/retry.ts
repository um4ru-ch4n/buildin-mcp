import { logger } from './logger.js';
import type { ToolContext } from '../types/tools.js';

export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  backoffMultiplier: number;
  maxDelayMs: number;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig,
  ctx?: Partial<ToolContext>,
  operationName = 'operation',
): Promise<T> {
  const retryCtx = logger.child(ctx ?? {}, 'retry');
  let lastError: unknown;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const isRetryable =
        error instanceof Error &&
        'isRetryable' in error &&
        typeof (error as { isRetryable: () => boolean }).isRetryable === 'function' &&
        (error as { isRetryable: () => boolean }).isRetryable();

      if (!isRetryable || attempt === config.maxAttempts) {
        logger.error(
          `${operationName} failed after ${attempt} attempt(s), not retrying`,
          retryCtx,
          error,
        );
        throw error;
      }

      const delay = Math.min(
        config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1),
        config.maxDelayMs,
      );

      logger.warn(
        `${operationName} failed (attempt ${attempt}/${config.maxAttempts}), retrying in ${delay}ms`,
        retryCtx,
        { attempt, delay },
      );

      await sleep(delay);
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
