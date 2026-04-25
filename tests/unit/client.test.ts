import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BuildinApiError } from '../../src/utils/errors.js';

// Mock config and env before importing BuildinClient
vi.mock('../../src/config/index.js', () => ({
  getConfig: () => ({
    api: { base_url: 'https://api.buildin.ai/v1', timeout_ms: 5000 },
    retry: { max_attempts: 1, initial_delay_ms: 1, backoff_multiplier: 2, max_delay_ms: 10 },
    logging: { default_level: 'info' },
    rate_limits: { read_per_minute: 1000, write_per_minute: 100, batch_per_minute: 10 },
    pagination: { default_page_size: 50, max_page_size: 100 },
  }),
  getEnv: () => ({
    BUILDIN_BOT_TOKEN: 'test-token-123',
    NODE_ENV: 'test',
  }),
}));

const mockCtx = { correlationId: 'test', toolName: 'test', callChain: ['test'] };

function mockFetchResponse(status: number, body: unknown, ok = status >= 200 && status < 300) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    statusText: String(status),
    json: () => Promise.resolve(body),
  });
}

describe('BuildinClient', () => {
  let BuildinClient: typeof import('../../src/client/buildin-client.js').BuildinClient;

  beforeEach(async () => {
    ({ BuildinClient } = await import('../../src/client/buildin-client.js'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('GET request returns parsed JSON', async () => {
    const mockData = { object: 'user', id: '123' };
    vi.stubGlobal('fetch', mockFetchResponse(200, mockData));

    const client = new BuildinClient();
    const result = await client.get('/v1/users/me', mockCtx);
    expect(result).toEqual(mockData);
  });

  it('sends Authorization Bearer header', async () => {
    const fetchMock = mockFetchResponse(200, {});
    vi.stubGlobal('fetch', fetchMock);

    const client = new BuildinClient();
    await client.get('/v1/test', mockCtx);

    const callArgs = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = callArgs[1].headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer test-token-123');
  });

  it('POST sends body as JSON', async () => {
    const fetchMock = mockFetchResponse(200, {});
    vi.stubGlobal('fetch', fetchMock);

    const client = new BuildinClient();
    await client.post('/v1/pages', { title: 'test' }, mockCtx);

    const callArgs = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(callArgs[1].method).toBe('POST');
    expect(JSON.parse(callArgs[1].body as string)).toEqual({ title: 'test' });
  });

  it('401 throws BuildinApiError with code=unauthorized', async () => {
    vi.stubGlobal('fetch', mockFetchResponse(401, { object: 'error', status: 401, code: 'unauthorized', message: 'Unauthorized' }, false));

    const client = new BuildinClient();
    await expect(client.get('/v1/test', mockCtx)).rejects.toMatchObject({
      code: 'unauthorized',
      status: 401,
    });
  });

  it('404 throws BuildinApiError with code=not_found', async () => {
    vi.stubGlobal('fetch', mockFetchResponse(404, { object: 'error', status: 404, code: 'not_found', message: 'Not found' }, false));

    const client = new BuildinClient();
    await expect(client.get('/v1/test', mockCtx)).rejects.toMatchObject({
      code: 'not_found',
      status: 404,
    });
  });

  it('429 throws BuildinApiError that isRetryable', async () => {
    vi.stubGlobal('fetch', mockFetchResponse(429, { object: 'error', status: 429, code: 'rate_limit', message: 'Too many requests' }, false));

    const client = new BuildinClient();
    try {
      await client.get('/v1/test', mockCtx);
    } catch (err) {
      expect(err).toBeInstanceOf(BuildinApiError);
      expect((err as BuildinApiError).isRetryable()).toBe(true);
    }
  });

  it('network error throws BuildinApiError with code=network_error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network failure')));

    const client = new BuildinClient();
    await expect(client.get('/v1/test', mockCtx)).rejects.toMatchObject({
      code: 'network_error',
    });
  });
});
