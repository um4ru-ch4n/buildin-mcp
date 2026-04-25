import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { BuildinClient } from '../client/buildin-client.js';
import { logger, generateCorrelationId } from '../utils/logger.js';
import type { ToolContext } from '../types/tools.js';
import type { Database, PaginatedList, Page } from '../types/api.js';

const RichTextTitleSchema = z.array(z.object({
  type: z.literal('text').default('text'),
  text: z.object({ content: z.string() }),
}));

const SelectOptionSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  color: z.string().optional(),
});

const DatabasePropertySchema = z.union([
  z.object({ name: z.string(), type: z.literal('title') }),
  z.object({ name: z.string(), type: z.literal('rich_text') }),
  z.object({ name: z.string(), type: z.literal('number'), number: z.object({ format: z.string().optional() }).optional() }),
  z.object({ name: z.string(), type: z.literal('select'), select: z.object({ options: z.array(SelectOptionSchema).optional() }).optional() }),
  z.object({ name: z.string(), type: z.literal('multi_select'), multi_select: z.object({ options: z.array(SelectOptionSchema).optional() }).optional() }),
  z.object({ name: z.string(), type: z.literal('date') }),
  z.object({ name: z.string(), type: z.literal('people') }),
  z.object({ name: z.string(), type: z.literal('files') }),
  z.object({ name: z.string(), type: z.literal('checkbox') }),
  z.object({ name: z.string(), type: z.literal('url') }),
  z.object({ name: z.string(), type: z.literal('email') }),
  z.object({ name: z.string(), type: z.literal('phone_number') }),
  z.object({ name: z.string(), type: z.literal('relation'), relation: z.object({ database_id: z.string() }).optional() }),
  z.object({ name: z.string(), type: z.literal('created_time') }),
  z.object({ name: z.string(), type: z.literal('created_by') }),
  z.object({ name: z.string(), type: z.literal('last_edited_time') }),
  z.object({ name: z.string(), type: z.literal('last_edited_by') }),
]);

const IconSchema = z.union([
  z.object({ emoji: z.string() }),
  z.object({ external: z.object({ url: z.string().url() }) }),
]);

const CoverSchema = z.object({
  external: z.object({ url: z.string().url() }),
});

export function registerDatabasesTools(server: McpServer, client: BuildinClient): void {
  // create_database
  server.tool(
    'create_database',
    'Create a new database (multi-dimensional table) in Buildin.ai within a parent page.',
    {
      parent_page_id: z.string().uuid().describe('ID of the parent page where the database will be created'),
      title: z.string().min(1).max(100).describe('Database title'),
      properties: z.record(z.string(), DatabasePropertySchema).describe(
        'Database schema: map of property name → property config. Must include at least a "title" type property.',
      ),
      icon: IconSchema.optional().describe('Database icon'),
      cover: CoverSchema.optional().describe('Database cover image'),
      is_inline: z.boolean().default(false).describe('Whether to create as an inline database'),
    },
    async (input) => {
      const correlationId = generateCorrelationId();
      const ctx: ToolContext = { correlationId, toolName: 'create_database', callChain: ['create_database'] };
      logger.info('Creating database', ctx, { title: input.title, parentPageId: input.parent_page_id });

      try {
        const body: Record<string, unknown> = {
          parent: { type: 'page_id', page_id: input.parent_page_id },
          title: [{ type: 'text', text: { content: input.title } }],
          properties: input.properties,
          is_inline: input.is_inline,
        };

        if (input.icon) body['icon'] = input.icon;
        if (input.cover) body['cover'] = input.cover;

        const database = await client.post<Database>('/v1/databases', body, ctx);
        logger.info('Database created successfully', ctx, { databaseId: database.id });
        return { content: [{ type: 'text', text: JSON.stringify(database, null, 2) }] };
      } catch (error) {
        logger.error('Failed to create database', ctx, error, { title: input.title });
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return { content: [{ type: 'text', text: `Error creating database: ${msg}` }], isError: true };
      }
    },
  );

  // get_database
  server.tool(
    'get_database',
    'Retrieve a Buildin.ai database schema by its ID. Returns database properties, title, icon, and metadata.',
    {
      database_id: z.string().uuid().describe('The ID of the database to retrieve'),
    },
    async (input) => {
      const correlationId = generateCorrelationId();
      const ctx: ToolContext = { correlationId, toolName: 'get_database', callChain: ['get_database'] };
      logger.info('Getting database', ctx, { databaseId: input.database_id });

      try {
        const database = await client.get<Database>(`/v1/databases/${input.database_id}`, ctx);
        logger.info('Database retrieved', ctx, { databaseId: database.id });
        return { content: [{ type: 'text', text: JSON.stringify(database, null, 2) }] };
      } catch (error) {
        logger.error('Failed to get database', ctx, error, { databaseId: input.database_id });
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return { content: [{ type: 'text', text: `Error getting database: ${msg}` }], isError: true };
      }
    },
  );

  // update_database
  server.tool(
    'update_database',
    'Update a Buildin.ai database: title, icon, cover, properties schema, or archive status. Set a property to null to delete it.',
    {
      database_id: z.string().uuid().describe('The ID of the database to update'),
      title: z.string().min(1).max(100).optional().describe('New database title'),
      icon: IconSchema.nullable().optional().describe('New icon (null to remove)'),
      cover: CoverSchema.nullable().optional().describe('New cover (null to remove)'),
      properties: z.record(z.string(), DatabasePropertySchema.nullable()).optional().describe(
        'Properties to add/update. Set a property to null to delete it.',
      ),
      archived: z.boolean().optional().describe('Archive or unarchive the database'),
    },
    async (input) => {
      const correlationId = generateCorrelationId();
      const ctx: ToolContext = { correlationId, toolName: 'update_database', callChain: ['update_database'] };
      logger.info('Updating database', ctx, { databaseId: input.database_id });

      try {
        const body: Record<string, unknown> = {};

        if (input.title !== undefined) {
          body['title'] = [{ type: 'text', text: { content: input.title } }];
        }
        if (input.icon !== undefined) body['icon'] = input.icon;
        if (input.cover !== undefined) body['cover'] = input.cover;
        if (input.properties !== undefined) body['properties'] = input.properties;
        if (input.archived !== undefined) body['archived'] = input.archived;

        const database = await client.patch<Database>(`/v1/databases/${input.database_id}`, body, ctx);
        logger.info('Database updated successfully', ctx, { databaseId: database.id });
        return { content: [{ type: 'text', text: JSON.stringify(database, null, 2) }] };
      } catch (error) {
        logger.error('Failed to update database', ctx, error, { databaseId: input.database_id });
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return { content: [{ type: 'text', text: `Error updating database: ${msg}` }], isError: true };
      }
    },
  );

  // query_database
  server.tool(
    'query_database',
    'Query records (pages) in a Buildin.ai database. Supports pagination and time-based filtering.',
    {
      database_id: z.string().uuid().describe('The ID of the database to query'),
      start_cursor: z.string().optional().describe('Pagination cursor from a previous response'),
      page_size: z.number().int().min(1).max(100).default(50).describe('Number of records per page (max 100)'),
      after_created_at: z.number().int().optional().describe('Return only records created after this Unix timestamp (ms)'),
      after_updated_at: z.number().int().optional().describe('Return only records updated after this Unix timestamp (ms)'),
    },
    async (input) => {
      const correlationId = generateCorrelationId();
      const ctx: ToolContext = { correlationId, toolName: 'query_database', callChain: ['query_database'] };
      logger.info('Querying database', ctx, { databaseId: input.database_id, pageSize: input.page_size });

      try {
        const body: Record<string, unknown> = {
          page_size: input.page_size,
        };
        if (input.start_cursor) body['start_cursor'] = input.start_cursor;
        if (input.after_created_at !== undefined) body['after_created_at'] = input.after_created_at;
        if (input.after_updated_at !== undefined) body['after_updated_at'] = input.after_updated_at;

        const result = await client.post<PaginatedList<Page>>(
          `/v1/databases/${input.database_id}/query`,
          body,
          ctx,
        );

        logger.info('Database query succeeded', ctx, {
          databaseId: input.database_id,
          count: result.results.length,
          hasMore: result.has_more,
        });

        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        logger.error('Failed to query database', ctx, error, { databaseId: input.database_id });
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return { content: [{ type: 'text', text: `Error querying database: ${msg}` }], isError: true };
      }
    },
  );
}
