import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BuildinClient } from '../../../src/client/buildin-client.js';
import { registerPagesTools } from '../../../src/tools/pages.js';

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

  return { mockServer, mockClient, registeredTools };
}

describe('Pages tools', () => {
  let mocks: ReturnType<typeof createMocks>;

  beforeEach(() => {
    mocks = createMocks();
    registerPagesTools(mocks.mockServer, mocks.mockClient);
  });

  describe('create_page', () => {
    it('calls POST /v1/pages', async () => {
      const fakePage = { object: 'page', id: 'page-123' };
      (mocks.mockClient.post as ReturnType<typeof vi.fn>).mockResolvedValue(fakePage);

      await mocks.registeredTools['create_page']!({ title: 'My Page' });

      expect(mocks.mockClient.post).toHaveBeenCalledWith(
        '/v1/pages',
        expect.objectContaining({
          properties: expect.objectContaining({
            title: expect.objectContaining({ type: 'title' }),
          }),
        }),
        expect.anything(),
      );
    });

    it('includes parent in body when provided', async () => {
      (mocks.mockClient.post as ReturnType<typeof vi.fn>).mockResolvedValue({ id: '1' });

      await mocks.registeredTools['create_page']!({
        title: 'Test',
        parent: { page_id: '550e8400-e29b-41d4-a716-446655440000' },
      });

      expect(mocks.mockClient.post).toHaveBeenCalledWith(
        '/v1/pages',
        expect.objectContaining({ parent: { page_id: '550e8400-e29b-41d4-a716-446655440000' } }),
        expect.anything(),
      );
    });

    it('returns page JSON in content', async () => {
      const fakePage = { object: 'page', id: 'page-123' };
      (mocks.mockClient.post as ReturnType<typeof vi.fn>).mockResolvedValue(fakePage);

      const result = await mocks.registeredTools['create_page']!({ title: 'My Page' });

      expect(result.content[0]?.text).toContain('page-123');
      expect(result.isError).toBeFalsy();
    });

    it('returns isError: true on failure', async () => {
      (mocks.mockClient.post as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('API error'));

      const result = await mocks.registeredTools['create_page']!({ title: 'Test' });

      expect(result.isError).toBe(true);
      expect(result.content[0]?.text).toContain('Error');
    });
  });

  describe('get_page', () => {
    it('calls GET /v1/pages/{page_id}', async () => {
      (mocks.mockClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'p1' });

      await mocks.registeredTools['get_page']!({ page_id: '550e8400-e29b-41d4-a716-446655440000' });

      expect(mocks.mockClient.get).toHaveBeenCalledWith(
        '/v1/pages/550e8400-e29b-41d4-a716-446655440000',
        expect.anything(),
      );
    });
  });

  describe('update_page', () => {
    it('calls PATCH /v1/pages/{page_id}', async () => {
      (mocks.mockClient.patch as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'p1' });

      await mocks.registeredTools['update_page']!({
        page_id: '550e8400-e29b-41d4-a716-446655440000',
        archived: true,
      });

      expect(mocks.mockClient.patch).toHaveBeenCalledWith(
        '/v1/pages/550e8400-e29b-41d4-a716-446655440000',
        expect.objectContaining({ archived: true }),
        expect.anything(),
      );
    });

    it('includes title in properties when provided', async () => {
      (mocks.mockClient.patch as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'p1' });

      await mocks.registeredTools['update_page']!({
        page_id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'New Title',
      });

      expect(mocks.mockClient.patch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          properties: expect.objectContaining({
            title: expect.objectContaining({ type: 'title' }),
          }),
        }),
        expect.anything(),
      );
    });
  });
});
