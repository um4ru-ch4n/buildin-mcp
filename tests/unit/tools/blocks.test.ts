import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BuildinClient } from '../../../src/client/buildin-client.js';
import { registerBlocksTools } from '../../../src/tools/blocks.js';

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

  registerBlocksTools(mockServer, mockClient);
  return { mockServer, mockClient, registeredTools };
}

const BLOCK_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('Blocks tools', () => {
  let mocks: ReturnType<typeof createMocks>;

  beforeEach(() => {
    mocks = createMocks();
  });

  describe('get_block', () => {
    it('calls GET /v1/blocks/{block_id}', async () => {
      (mocks.mockClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({ id: BLOCK_ID });
      await mocks.registeredTools['get_block']!({ block_id: BLOCK_ID });
      expect(mocks.mockClient.get).toHaveBeenCalledWith(`/blocks/${BLOCK_ID}`, expect.anything());
    });
  });

  describe('get_block_children', () => {
    it('calls GET with default page_size', async () => {
      (mocks.mockClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({ results: [] });
      await mocks.registeredTools['get_block_children']!({ block_id: BLOCK_ID, page_size: 50, recursive: false });
      expect(mocks.mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining(`/blocks/${BLOCK_ID}/children`),
        expect.anything(),
      );
    });

    it('includes start_cursor in query params when provided', async () => {
      (mocks.mockClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({ results: [] });
      await mocks.registeredTools['get_block_children']!({
        block_id: BLOCK_ID,
        page_size: 10,
        start_cursor: 'cursor-abc',
        recursive: false,
      });
      const callPath = (mocks.mockClient.get as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(callPath).toContain('start_cursor=cursor-abc');
    });

    it('includes recursive=true in query params', async () => {
      (mocks.mockClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({ results: [] });
      await mocks.registeredTools['get_block_children']!({ block_id: BLOCK_ID, page_size: 50, recursive: true });
      const callPath = (mocks.mockClient.get as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(callPath).toContain('recursive=true');
    });
  });

  describe('append_block_children', () => {
    it('calls PATCH /v1/blocks/{id}/children with children', async () => {
      (mocks.mockClient.patch as ReturnType<typeof vi.fn>).mockResolvedValue({ results: [] });
      const children = [{ type: 'paragraph', data: { rich_text: [{ type: 'text', text: { content: 'Hello' } }] } }];
      await mocks.registeredTools['append_block_children']!({ block_id: BLOCK_ID, children });
      expect(mocks.mockClient.patch).toHaveBeenCalledWith(
        `/blocks/${BLOCK_ID}/children`,
        { children },
        expect.anything(),
      );
    });
  });

  describe('update_block', () => {
    it('calls PATCH /v1/blocks/{id}', async () => {
      (mocks.mockClient.patch as ReturnType<typeof vi.fn>).mockResolvedValue({ id: BLOCK_ID });
      await mocks.registeredTools['update_block']!({ block_id: BLOCK_ID, archived: true });
      expect(mocks.mockClient.patch).toHaveBeenCalledWith(
        `/blocks/${BLOCK_ID}`,
        expect.objectContaining({ archived: true }),
        expect.anything(),
      );
    });
  });

  describe('delete_block', () => {
    it('calls DELETE /v1/blocks/{id}', async () => {
      (mocks.mockClient.delete as ReturnType<typeof vi.fn>).mockResolvedValue({ deleted: true });
      await mocks.registeredTools['delete_block']!({ block_id: BLOCK_ID });
      expect(mocks.mockClient.delete).toHaveBeenCalledWith(`/blocks/${BLOCK_ID}`, expect.anything());
    });

    it('returns isError: true on failure', async () => {
      (mocks.mockClient.delete as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));
      const result = await mocks.registeredTools['delete_block']!({ block_id: BLOCK_ID });
      expect(result.isError).toBe(true);
    });
  });
});
