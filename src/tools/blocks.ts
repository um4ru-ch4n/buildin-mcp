import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { BuildinClient } from '../client/buildin-client.js';
import { logger, generateCorrelationId } from '../utils/logger.js';
import type { ToolContext } from '../types/tools.js';
import type { Block, PaginatedList } from '../types/api.js';

// Rich text item schema
const RichTextItemSchema = z.object({
  type: z.enum(['text', 'mention', 'equation']).default('text'),
  text: z.object({
    content: z.string().max(2000),
    link: z.object({ url: z.string() }).nullable().optional(),
  }).optional(),
  annotations: z.object({
    bold: z.boolean().optional(),
    italic: z.boolean().optional(),
    strikethrough: z.boolean().optional(),
    underline: z.boolean().optional(),
    code: z.boolean().optional(),
    color: z.string().optional(),
  }).optional(),
});

// Block data schema — flexible to support all block types
const BlockDataSchema = z.object({
  rich_text: z.array(RichTextItemSchema).optional(),
  text_color: z.string().optional(),
  background_color: z.string().optional(),
  checked: z.boolean().optional(),
  language: z.string().optional(),
  url: z.string().optional(),
  caption: z.array(RichTextItemSchema).optional(),
  icon: z.union([
    z.object({ emoji: z.string() }),
    z.object({ external: z.object({ url: z.string() }) }),
  ]).optional(),
  expression: z.string().optional(),
  page_id: z.string().optional(),
  table_width: z.number().int().positive().optional(),
  has_column_header: z.boolean().optional(),
  has_row_header: z.boolean().optional(),
}).passthrough(); // allow additional fields for future block types

// Block type enum
const BlockTypeSchema = z.enum([
  'paragraph', 'heading_1', 'heading_2', 'heading_3',
  'bulleted_list_item', 'numbered_list_item', 'to_do',
  'quote', 'toggle', 'code', 'image', 'file', 'bookmark',
  'embed', 'callout', 'equation', 'link_to_page',
  'template', 'synced_block', 'divider', 'column_list',
  'column', 'table', 'table_row', 'child_page', 'child_database',
]);

// Schema for a block to append
const AppendBlockSchema = z.object({
  type: BlockTypeSchema.describe('Block type'),
  data: BlockDataSchema.describe('Block content data'),
});

export function registerBlocksTools(server: McpServer, client: BuildinClient): void {
  // get_block
  server.tool(
    'get_block',
    'Retrieve a single block by its ID. Returns block type, content data, and metadata.',
    {
      block_id: z.string().uuid().describe('The ID of the block to retrieve'),
    },
    async (input) => {
      const correlationId = generateCorrelationId();
      const ctx: ToolContext = { correlationId, toolName: 'get_block', callChain: ['get_block'] };
      logger.info('Getting block', ctx, { blockId: input.block_id });

      try {
        const block = await client.get<Block>(`/blocks/${input.block_id}`, ctx);
        logger.info('Block retrieved', ctx, { blockId: block.id, type: block.type });
        return { content: [{ type: 'text', text: JSON.stringify(block, null, 2) }] };
      } catch (error) {
        logger.error('Failed to get block', ctx, error, { blockId: input.block_id });
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return { content: [{ type: 'text', text: `Error getting block: ${msg}` }], isError: true };
      }
    },
  );

  // get_block_children
  server.tool(
    'get_block_children',
    'Get child blocks of a page or block. Supports pagination. Use block_id with a page ID to get page content.',
    {
      block_id: z.string().uuid().describe('Parent block or page ID'),
      page_size: z.number().int().min(1).max(100).default(50).describe('Number of blocks per page (max 100)'),
      start_cursor: z.string().optional().describe('Pagination cursor from previous response'),
      recursive: z.boolean().default(false).describe('Recursively get all nested child blocks (max 50 levels deep)'),
    },
    async (input) => {
      const correlationId = generateCorrelationId();
      const ctx: ToolContext = { correlationId, toolName: 'get_block_children', callChain: ['get_block_children'] };
      logger.info('Getting block children', ctx, { blockId: input.block_id, pageSize: input.page_size });

      try {
        const params = new URLSearchParams({
          page_size: String(input.page_size),
        });
        if (input.start_cursor) params.set('start_cursor', input.start_cursor);
        if (input.recursive) params.set('recursive', 'true');

        const result = await client.get<PaginatedList<Block>>(
          `/blocks/${input.block_id}/children?${params.toString()}`,
          ctx,
        );

        logger.info('Block children retrieved', ctx, {
          blockId: input.block_id,
          count: result.results?.length ?? 0,
          hasMore: result.has_more,
        });

        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        logger.error('Failed to get block children', ctx, error, { blockId: input.block_id });
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return { content: [{ type: 'text', text: `Error getting block children: ${msg}` }], isError: true };
      }
    },
  );

  // append_block_children
  server.tool(
    'append_block_children',
    'Append child blocks to a page or block. Maximum 100 blocks per request. Supported types: paragraph, heading_1/2/3, bulleted_list_item, numbered_list_item, to_do, quote, toggle, code, callout, divider, image, bookmark, table, column_list, etc.',
    {
      block_id: z.string().uuid().describe('Parent block or page ID'),
      children: z.array(AppendBlockSchema).min(1).max(100).describe('Array of blocks to append (max 100)'),
    },
    async (input) => {
      const correlationId = generateCorrelationId();
      const ctx: ToolContext = { correlationId, toolName: 'append_block_children', callChain: ['append_block_children'] };
      logger.info('Appending block children', ctx, { blockId: input.block_id, count: input.children.length });

      try {
        const result = await client.patch<PaginatedList<Block>>(
          `/blocks/${input.block_id}/children`,
          { children: input.children },
          ctx,
        );

        logger.info('Blocks appended successfully', ctx, {
          blockId: input.block_id,
          appended: result.results?.length ?? 0,
        });

        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        logger.error('Failed to append block children', ctx, error, { blockId: input.block_id });
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return { content: [{ type: 'text', text: `Error appending blocks: ${msg}` }], isError: true };
      }
    },
  );

  // update_block
  server.tool(
    'update_block',
    'Update the content, type, or archive status of an existing block.',
    {
      block_id: z.string().uuid().describe('The ID of the block to update'),
      type: BlockTypeSchema.optional().describe('New block type (changes the block type)'),
      data: BlockDataSchema.optional().describe('New block content data'),
      archived: z.boolean().optional().describe('Archive or unarchive the block'),
    },
    async (input) => {
      const correlationId = generateCorrelationId();
      const ctx: ToolContext = { correlationId, toolName: 'update_block', callChain: ['update_block'] };
      logger.info('Updating block', ctx, { blockId: input.block_id });

      try {
        const body: Record<string, unknown> = {};
        if (input.type !== undefined) body['type'] = input.type;
        if (input.data !== undefined) body['data'] = input.data;
        if (input.archived !== undefined) body['archived'] = input.archived;

        const block = await client.patch<Block>(`/blocks/${input.block_id}`, body, ctx);
        logger.info('Block updated successfully', ctx, { blockId: block.id });
        return { content: [{ type: 'text', text: JSON.stringify(block, null, 2) }] };
      } catch (error) {
        logger.error('Failed to update block', ctx, error, { blockId: input.block_id });
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return { content: [{ type: 'text', text: `Error updating block: ${msg}` }], isError: true };
      }
    },
  );

  // delete_block
  server.tool(
    'delete_block',
    'Delete a block and all its children. This operation is irreversible.',
    {
      block_id: z.string().uuid().describe('The ID of the block to delete'),
    },
    async (input) => {
      const correlationId = generateCorrelationId();
      const ctx: ToolContext = { correlationId, toolName: 'delete_block', callChain: ['delete_block'] };
      logger.info('Deleting block', ctx, { blockId: input.block_id });

      try {
        const result = await client.delete<{ object: string; id: string; deleted: boolean }>(
          `/blocks/${input.block_id}`,
          ctx,
        );

        logger.info('Block deleted successfully', ctx, { blockId: input.block_id });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        logger.error('Failed to delete block', ctx, error, { blockId: input.block_id });
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return { content: [{ type: 'text', text: `Error deleting block: ${msg}` }], isError: true };
      }
    },
  );
}
