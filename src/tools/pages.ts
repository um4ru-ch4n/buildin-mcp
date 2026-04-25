import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { BuildinClient } from '../client/buildin-client.js';
import { logger, generateCorrelationId } from '../utils/logger.js';
import { FlexibleObjectSchema } from '../utils/schema-helpers.js';
import type { ToolContext } from '../types/tools.js';
import type { Page } from '../types/api.js';

export function registerPagesTools(server: McpServer, client: BuildinClient): void {
  // create_page
  server.tool(
    'create_page',
    'Create a new page in Buildin.ai. Can be created as a child of another page or as a record in a database.',
    {
      parent: FlexibleObjectSchema.optional().describe('Parent: { page_id: "..." } or { database_id: "..." }. Omit for default location.'),
      title: z.string().min(1).max(2000).describe('Page title'),
      icon: FlexibleObjectSchema.optional().describe('Page icon: { emoji: "🧪" } or { external: { url: "..." } }'),
      cover: FlexibleObjectSchema.optional().describe('Page cover: { external: { url: "..." } }'),
      properties: FlexibleObjectSchema.optional().describe('Additional page properties (for database records). E.g. { "Status": { "type": "select", "select": { "name": "Done" } } }'),
    },
    async (input) => {
      const correlationId = generateCorrelationId();
      const ctx: ToolContext = { correlationId, toolName: 'create_page', callChain: ['create_page'] };
      logger.info('Creating page', ctx, { title: input.title, hasParent: !!input.parent });

      try {
        const body: Record<string, unknown> = {
          properties: {
            title: {
              type: 'title',
              title: [{ type: 'text', text: { content: input.title } }],
            },
            ...input.properties,
          },
        };

        if (input.parent) body['parent'] = input.parent;
        if (input.icon) body['icon'] = input.icon;
        if (input.cover) body['cover'] = input.cover;

        const page = await client.post<Page>('/pages', body, ctx);
        logger.info('Page created successfully', ctx, { pageId: page.id });
        return { content: [{ type: 'text', text: JSON.stringify(page, null, 2) }] };
      } catch (error) {
        logger.error('Failed to create page', ctx, error, { title: input.title });
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return { content: [{ type: 'text', text: `Error creating page: ${msg}` }], isError: true };
      }
    },
  );

  // get_page
  server.tool(
    'get_page',
    'Retrieve a Buildin.ai page by its ID. Returns page metadata, properties, icon, cover, and parent info.',
    {
      page_id: z.string().describe('The ID of the page to retrieve'),
    },
    async (input) => {
      const correlationId = generateCorrelationId();
      const ctx: ToolContext = { correlationId, toolName: 'get_page', callChain: ['get_page'] };
      logger.info('Getting page', ctx, { pageId: input.page_id });

      try {
        const page = await client.get<Page>(`/pages/${input.page_id}`, ctx);
        logger.info('Page retrieved successfully', ctx, { pageId: page.id });
        return { content: [{ type: 'text', text: JSON.stringify(page, null, 2) }] };
      } catch (error) {
        logger.error('Failed to get page', ctx, error, { pageId: input.page_id });
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return { content: [{ type: 'text', text: `Error getting page: ${msg}` }], isError: true };
      }
    },
  );

  // update_page
  server.tool(
    'update_page',
    'Update a Buildin.ai page properties, icon, cover, or archive status.',
    {
      page_id: z.string().describe('The ID of the page to update'),
      title: z.string().min(1).max(2000).optional().describe('New page title'),
      icon: FlexibleObjectSchema.nullable().optional().describe('New page icon (null to remove)'),
      cover: FlexibleObjectSchema.nullable().optional().describe('New page cover (null to remove)'),
      archived: z.preprocess((v) => v === 'true' || v === true, z.boolean()).optional().describe('Archive or unarchive the page'),
      properties: FlexibleObjectSchema.optional().describe('Properties to update. E.g. { "Status": { "type": "select", "select": { "name": "Done" } } }'),
    },
    async (input) => {
      const correlationId = generateCorrelationId();
      const ctx: ToolContext = { correlationId, toolName: 'update_page', callChain: ['update_page'] };
      logger.info('Updating page', ctx, { pageId: input.page_id });

      try {
        const body: Record<string, unknown> = {};

        const properties: Record<string, unknown> = { ...input.properties };
        if (input.title !== undefined) {
          properties['title'] = {
            type: 'title',
            title: [{ type: 'text', text: { content: input.title } }],
          };
        }
        if (Object.keys(properties).length > 0) body['properties'] = properties;

        if (input.icon !== undefined) body['icon'] = input.icon;
        if (input.cover !== undefined) body['cover'] = input.cover;
        if (input.archived !== undefined) body['archived'] = input.archived;

        const page = await client.patch<Page>(`/pages/${input.page_id}`, body, ctx);
        logger.info('Page updated successfully', ctx, { pageId: page.id });
        return { content: [{ type: 'text', text: JSON.stringify(page, null, 2) }] };
      } catch (error) {
        logger.error('Failed to update page', ctx, error, { pageId: input.page_id });
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return { content: [{ type: 'text', text: `Error updating page: ${msg}` }], isError: true };
      }
    },
  );
}
