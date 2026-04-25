import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, generateCorrelationId } from '../../../src/utils/logger.js';

describe('generateCorrelationId', () => {
  it('returns a non-empty string', () => {
    expect(typeof generateCorrelationId()).toBe('string');
    expect(generateCorrelationId().length).toBeGreaterThan(0);
  });

  it('returns unique values on each call', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateCorrelationId()));
    expect(ids.size).toBe(100);
  });
});

describe('logger.child', () => {
  it('adds step to callChain', () => {
    const ctx = { correlationId: 'abc', toolName: 'test', callChain: ['root'] };
    const child = logger.child(ctx, 'step1');
    expect(child.callChain).toEqual(['root', 'step1']);
  });

  it('does not mutate original context', () => {
    const ctx = { correlationId: 'abc', toolName: 'test', callChain: ['root'] };
    logger.child(ctx, 'step1');
    expect(ctx.callChain).toEqual(['root']);
  });

  it('starts new callChain if none exists', () => {
    const child = logger.child({ correlationId: 'abc' }, 'step1');
    expect(child.callChain).toEqual(['step1']);
  });
});

describe('logger output', () => {
  let stderrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    stderrSpy.mockRestore();
    vi.unstubAllEnvs();
  });

  it('writes to stderr, not stdout', () => {
    const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    logger.info('test message');
    expect(stderrSpy).toHaveBeenCalled();
    expect(stdoutSpy).not.toHaveBeenCalled();
    stdoutSpy.mockRestore();
  });

  it('in development mode outputs human-readable text containing level', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('LOG_LEVEL', 'debug');
    logger.debug('hello dev');
    const output = String((stderrSpy.mock.calls[0] as unknown[])[0]);
    expect(output).toContain('DEBUG');
    expect(output).toContain('hello dev');
  });

  it('in production mode outputs valid JSON', () => {
    vi.stubEnv('NODE_ENV', 'production');
    logger.info('hello prod');
    const output = String((stderrSpy.mock.calls[0] as unknown[])[0]).trim();
    expect(() => JSON.parse(output)).not.toThrow();
    const parsed = JSON.parse(output);
    expect(parsed.message).toBe('hello prod');
    expect(parsed.level).toBe('info');
  });

  it('includes correlationId and callChain in output', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const ctx = { correlationId: 'test123', toolName: 'myTool', callChain: ['a', 'b'] };
    logger.info('msg', ctx);
    const output = String((stderrSpy.mock.calls[0] as unknown[])[0]).trim();
    const parsed = JSON.parse(output);
    expect(parsed.correlationId).toBe('test123');
    expect(parsed.callChain).toBe('a → b');
  });
});
