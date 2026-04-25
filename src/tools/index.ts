import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BuildinClient } from '../client/buildin-client.js';
import { registerPagesTools } from './pages.js';
import { registerBlocksTools } from './blocks.js';
import { registerDatabasesTools } from './databases.js';
import { registerSearchTools } from './search.js';
import { registerUsersTools } from './users.js';

export function registerAllTools(server: McpServer, client: BuildinClient): void {
  registerPagesTools(server, client);
  registerBlocksTools(server, client);
  registerDatabasesTools(server, client);
  registerSearchTools(server, client);
  registerUsersTools(server, client);
}
