import { describe, it, expect, vi } from 'vitest';
import { withRetry } from '../../../src/utils/retry.js';
import { BuildinApiError } from '../../../src/utils/errors.js';

const fastConfig = {
  maxAttempts: 3,
  initialDelayMs: 1,
  backoffMultiplier: 2,
  maxDelayMs: 10,
};

describe('withRetry', () => {
  it('returns result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await withRetry(fn, fastConfig);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on retryable error and succeeds', async () => {
    const retryableError = BuildinApiError.fromHttpStatus(429, 'rate limit');
    const fn = vi.fn()
      .mockRejectedValueOnce(retryableError)
      .mockResolvedValue('ok');

    const result = await withRetry(fn, fastConfig);

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does not retry non-retryable error', async () => {
    const nonRetryable = BuildinApiError.fromHttpStatus(404, 'not found');
    const fn = vi.fn().mockRejectedValue(nonRetryable);

    await expect(withRetry(fn, fastConfig)).rejects.toThrow(BuildinApiError);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('throws after maxAttempts retryable errors', async () => {
    const retryableError = BuildinApiError.fromHttpStatus(500, 'server error');
    const fn = vi.fn().mockRejectedValue(retryableError);

    await expect(withRetry(fn, fastConfig)).rejects.toThrow(BuildinApiError);
    expect(fn).toHaveBeenCalledTimes(fastConfig.maxAttempts);
  });

  it('does not retry plain (non-BuildinApiError) errors', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('plain error'));
    await expect(withRetry(fn, fastConfig)).rejects.toThrow('plain error');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
