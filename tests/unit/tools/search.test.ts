import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BuildinClient } from '../../../src/client/buildin-client.js';
import { registerSearchTools } from '../../../src/tools/search.js';

type ToolHandler = (input: Record<string, unknown>) => Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }>;

function createMocks() {
  const registeredTools: Record<string, ToolHandler> = {};
  const mockServer = {
    tool: vi.fn((name: string, _desc: string, _schema: unknown, handler: ToolHandler) => {
      registeredTools[name] = handler;
    }),
  } as unknown as McpServer;
  const mockClient = {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  } as unknown as BuildinClient;
  registerSearchTools(mockServer, mockClient);
  return { mockServer, mockClient, registeredTools };
}

describe('Search tool', () => {
  let mocks: ReturnType<typeof createMocks>;

  beforeEach(() => {
    mocks = createMocks();
  });

  it('calls POST /v1/search with query and page_size', async () => {
    (mocks.mockClient.post as ReturnType<typeof vi.fn>).mockResolvedValue({ results: [] });

    await mocks.registeredTools['search']!({ query: 'hello', page_size: 10 });

    expect(mocks.mockClient.post).toHaveBeenCalledWith(
      '/search',
      expect.objectContaining({ query: 'hello', page_size: 10 }),
      expect.anything(),
    );
  });

  it('uses empty string query by default', async () => {
    (mocks.mockClient.post as ReturnType<typeof vi.fn>).mockResolvedValue({ results: [] });

    await mocks.registeredTools['search']!({ query: '', page_size: 10 });

    expect(mocks.mockClient.post).toHaveBeenCalledWith(
      '/search',
      expect.objectContaining({ query: '' }),
      expect.anything(),
    );
  });

  it('includes start_cursor when provided', async () => {
    (mocks.mockClient.post as ReturnType<typeof vi.fn>).mockResolvedValue({ results: [] });

    await mocks.registeredTools['search']!({ query: 'test', page_size: 10, start_cursor: 'cursor-xyz' });

    expect(mocks.mockClient.post).toHaveBeenCalledWith(
      '/search',
      expect.objectContaining({ start_cursor: 'cursor-xyz' }),
      expect.anything(),
    );
  });

  it('returns results in content', async () => {
    (mocks.mockClient.post as ReturnType<typeof vi.fn>).mockResolvedValue({ results: [{ id: 'p1' }], has_more: false });

    const result = await mocks.registeredTools['search']!({ query: 'test', page_size: 10 });

    expect(result.content[0]?.text).toContain('p1');
    expect(result.isError).toBeFalsy();
  });

  it('returns isError: true on failure', async () => {
    (mocks.mockClient.post as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));

    const result = await mocks.registeredTools['search']!({ query: 'test', page_size: 10 });

    expect(result.isError).toBe(true);
  });
});
