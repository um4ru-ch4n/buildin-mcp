import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { BuildinClient } from './client/buildin-client.js';
import { getConfig, getEnv } from './config/index.js';
import { registerAllTools } from './tools/index.js';
import { logger } from './utils/logger.js';

async function main(): Promise<void> {
  // Validate config and env early — fail fast if misconfigured
  const config = getConfig();
  const env = getEnv();

  logger.info('Starting buildin-mcp server', undefined, {
    version: '1.0.0',
    apiBaseUrl: config.api.base_url,
    logLevel: env.LOG_LEVEL ?? config.logging.default_level,
    nodeEnv: env.NODE_ENV,
  });

  const client = new BuildinClient();

  const server = new McpServer({
    name: 'buildin-mcp',
    version: '1.0.0',
  });

  registerAllTools(server, client);

  logger.info('All tools registered, connecting transport...');

  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info('buildin-mcp server running on stdio');
}

main().catch((error) => {
  logger.error('Fatal error during startup', undefined, error);
  process.exit(1);
});
