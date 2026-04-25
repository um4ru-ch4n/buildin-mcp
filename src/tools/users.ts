import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { BuildinClient } from '../client/buildin-client.js';
import { logger, generateCorrelationId } from '../utils/logger.js';
import type { ToolContext } from '../types/tools.js';
import type { User } from '../types/api.js';

export function registerUsersTools(server: McpServer, client: BuildinClient): void {
  server.tool(
    'get_me',
    'Get information about the current bot creator (the user who created the Buildin.ai integration token).',
    {},
    async () => {
      const correlationId = generateCorrelationId();
      const ctx: ToolContext = { correlationId, toolName: 'get_me', callChain: ['get_me'] };
      logger.info('Getting current user info', ctx);

      try {
        const user = await client.get<User>('/v1/users/me', ctx);
        logger.info('User info retrieved', ctx, { userId: user.id });
        return { content: [{ type: 'text', text: JSON.stringify(user, null, 2) }] };
      } catch (error) {
        logger.error('Failed to get user info', ctx, error);
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return { content: [{ type: 'text', text: `Error getting user info: ${msg}` }], isError: true };
      }
    },
  );
}
