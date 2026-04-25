import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BuildinClient } from '../../../src/client/buildin-client.js';
import { registerUsersTools } from '../../../src/tools/users.js';

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
  registerUsersTools(mockServer, mockClient);
  return { mockServer, mockClient, registeredTools };
}

describe('Users tool', () => {
  let mocks: ReturnType<typeof createMocks>;

  beforeEach(() => {
    mocks = createMocks();
  });

  it('calls GET /v1/users/me', async () => {
    (mocks.mockClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'u1', object: 'user' });

    await mocks.registeredTools['get_me']!({});

    expect(mocks.mockClient.get).toHaveBeenCalledWith('/users/me', expect.anything());
  });

  it('returns user JSON in content', async () => {
    (mocks.mockClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'u1', object: 'user', name: 'John' });

    const result = await mocks.registeredTools['get_me']!({});

    expect(result.content[0]?.text).toContain('u1');
    expect(result.isError).toBeFalsy();
  });

  it('returns isError: true on failure', async () => {
    (mocks.mockClient.get as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));

    const result = await mocks.registeredTools['get_me']!({});

    expect(result.isError).toBe(true);
  });
});
