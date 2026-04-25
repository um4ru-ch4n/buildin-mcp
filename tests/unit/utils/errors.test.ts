import { describe, it, expect } from 'vitest';
import { BuildinApiError } from '../../../src/utils/errors.js';

describe('BuildinApiError', () => {
  it('is instanceof Error', () => {
    const err = new BuildinApiError('test', 'not_found', 404);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(BuildinApiError);
  });

  it('has correct name', () => {
    const err = new BuildinApiError('test', 'not_found', 404);
    expect(err.name).toBe('BuildinApiError');
  });

  describe('fromHttpStatus', () => {
    const cases: [number, string][] = [
      [400, 'validation_error'],
      [401, 'unauthorized'],
      [403, 'forbidden'],
      [404, 'not_found'],
      [422, 'unsupported_block_type'],
      [429, 'rate_limit'],
      [500, 'server_error'],
      [503, 'server_error'],
      [999, 'server_error'],
      [299, 'unknown'],
    ];
    it.each(cases)('status %i maps to code %s', (status, expectedCode) => {
      const err = BuildinApiError.fromHttpStatus(status, 'msg');
      expect(err.code).toBe(expectedCode);
      expect(err.status).toBe(status);
    });
  });

  describe('fromApiResponse', () => {
    it('maps API code to BuildinErrorCode', () => {
      const err = BuildinApiError.fromApiResponse({
        object: 'error',
        status: 403,
        code: 'forbidden',
        message: 'No access',
      });
      expect(err.code).toBe('forbidden');
      expect(err.status).toBe(403);
      expect(err.message).toBe('No access');
    });

    it('maps unknown API code to unknown', () => {
      const err = BuildinApiError.fromApiResponse({
        object: 'error',
        status: 400,
        code: 'some_unknown_code',
        message: 'Unknown',
      });
      expect(err.code).toBe('unknown');
    });
  });

  describe('isRetryable', () => {
    it('returns true for 429', () => {
      expect(BuildinApiError.fromHttpStatus(429, '').isRetryable()).toBe(true);
    });
    it('returns true for 500', () => {
      expect(BuildinApiError.fromHttpStatus(500, '').isRetryable()).toBe(true);
    });
    it('returns true for 503', () => {
      expect(BuildinApiError.fromHttpStatus(503, '').isRetryable()).toBe(true);
    });
    it('returns false for 400', () => {
      expect(BuildinApiError.fromHttpStatus(400, '').isRetryable()).toBe(false);
    });
    it('returns false for 403', () => {
      expect(BuildinApiError.fromHttpStatus(403, '').isRetryable()).toBe(false);
    });
    it('returns false for 404', () => {
      expect(BuildinApiError.fromHttpStatus(404, '').isRetryable()).toBe(false);
    });
  });
});
