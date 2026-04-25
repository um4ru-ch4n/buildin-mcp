import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BuildinClient } from '../../../src/client/buildin-client.js';
import { registerDatabasesTools } from '../../../src/tools/databases.js';

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
  registerDatabasesTools(mockServer, mockClient);
  return { mockServer, mockClient, registeredTools };
}

const PAGE_ID = '550e8400-e29b-41d4-a716-446655440000';
const DB_ID = '550e8400-e29b-41d4-a716-446655440001';

const minimalProperties = {
  name: { name: 'Title', type: 'title' },
};

describe('Databases tools', () => {
  let mocks: ReturnType<typeof createMocks>;

  beforeEach(() => {
    mocks = createMocks();
  });

  describe('create_database', () => {
    it('calls POST /v1/databases with parent and title', async () => {
      (mocks.mockClient.post as ReturnType<typeof vi.fn>).mockResolvedValue({ id: DB_ID });

      await mocks.registeredTools['create_database']!({
        parent_page_id: PAGE_ID,
        title: 'My DB',
        properties: minimalProperties,
        is_inline: false,
      });

      expect(mocks.mockClient.post).toHaveBeenCalledWith(
        '/databases',
        expect.objectContaining({
          parent: { type: 'page_id', page_id: PAGE_ID },
          title: [{ type: 'text', text: { content: 'My DB' } }],
        }),
        expect.anything(),
      );
    });

    it('returns isError: true on failure', async () => {
      (mocks.mockClient.post as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));
      const result = await mocks.registeredTools['create_database']!({
        parent_page_id: PAGE_ID,
        title: 'Test',
        properties: minimalProperties,
        is_inline: false,
      });
      expect(result.isError).toBe(true);
    });
  });

  describe('get_database', () => {
    it('calls GET /v1/databases/{id}', async () => {
      (mocks.mockClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({ id: DB_ID });
      await mocks.registeredTools['get_database']!({ database_id: DB_ID });
      expect(mocks.mockClient.get).toHaveBeenCalledWith(`/databases/${DB_ID}`, expect.anything());
    });
  });

  describe('update_database', () => {
    it('formats title as RichText array', async () => {
      (mocks.mockClient.patch as ReturnType<typeof vi.fn>).mockResolvedValue({ id: DB_ID });

      await mocks.registeredTools['update_database']!({ database_id: DB_ID, title: 'New Title' });

      expect(mocks.mockClient.patch).toHaveBeenCalledWith(
        `/databases/${DB_ID}`,
        expect.objectContaining({
          title: [{ type: 'text', text: { content: 'New Title' } }],
        }),
        expect.anything(),
      );
    });

    it('passes null properties (delete property)', async () => {
      (mocks.mockClient.patch as ReturnType<typeof vi.fn>).mockResolvedValue({ id: DB_ID });

      await mocks.registeredTools['update_database']!({
        database_id: DB_ID,
        properties: { old_prop: null },
      });

      expect(mocks.mockClient.patch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ properties: { old_prop: null } }),
        expect.anything(),
      );
    });
  });

  describe('query_database', () => {
    it('calls POST /v1/databases/{id}/query', async () => {
      (mocks.mockClient.post as ReturnType<typeof vi.fn>).mockResolvedValue({ results: [] });
      await mocks.registeredTools['query_database']!({ database_id: DB_ID, page_size: 50 });
      expect(mocks.mockClient.post).toHaveBeenCalledWith(
        `/databases/${DB_ID}/query`,
        expect.objectContaining({ page_size: 50 }),
        expect.anything(),
      );
    });

    it('passes after_created_at when provided', async () => {
      (mocks.mockClient.post as ReturnType<typeof vi.fn>).mockResolvedValue({ results: [] });
      await mocks.registeredTools['query_database']!({
        database_id: DB_ID,
        page_size: 10,
        after_created_at: 1700000000000,
      });
      expect(mocks.mockClient.post).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ after_created_at: 1700000000000 }),
        expect.anything(),
      );
    });
  });
});
