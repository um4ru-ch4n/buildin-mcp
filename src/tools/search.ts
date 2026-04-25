import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { BuildinClient } from '../client/buildin-client.js';
import { logger, generateCorrelationId } from '../utils/logger.js';
import type { ToolContext } from '../types/tools.js';
import type { PaginatedList, Page } from '../types/api.js';

export function registerSearchTools(server: McpServer, client: BuildinClient): void {
  server.tool(
    'search',
    'Search for pages within the bot\'s authorized scope in Buildin.ai. Supports full-text and semantic search. An empty query returns all accessible pages.',
    {
      query: z.string().default('').describe('Search keywords. Leave empty to list all accessible pages.'),
      start_cursor: z.string().optional().describe('Pagination cursor from a previous response'),
      page_size: z.coerce.number().int().min(1).max(100).default(10).describe('Number of results per page (max 100)'),
    },
    async (input) => {
      const correlationId = generateCorrelationId();
      const ctx: ToolContext = { correlationId, toolName: 'search', callChain: ['search'] };
      logger.info('Searching pages', ctx, { query: input.query, pageSize: input.page_size });

      try {
        const body: Record<string, unknown> = {
          query: input.query,
          page_size: input.page_size,
        };
        if (input.start_cursor) body['start_cursor'] = input.start_cursor;

        const result = await client.post<PaginatedList<Page>>('/search', body, ctx);

        logger.info('Search completed', ctx, {
          query: input.query,
          resultCount: result.results?.length ?? 0,
          hasMore: result.has_more,
        });

        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        logger.error('Search failed', ctx, error, { query: input.query });
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return { content: [{ type: 'text', text: `Error searching: ${msg}` }], isError: true };
      }
    },
  );
}
