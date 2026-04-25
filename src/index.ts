import { createServer } from 'http';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { BuildinClient } from './client/buildin-client.js';
import { getConfig, getEnv, type AppConfig, type AppEnv } from './config/index.js';
import { registerAllTools } from './tools/index.js';
import { logger } from './utils/logger.js';

function createMcpServer(client: BuildinClient): McpServer {
  const server = new McpServer({
    name: 'buildin-mcp',
    version: '1.0.0',
  });
  registerAllTools(server, client);
  return server;
}

async function startStdioServer(env: AppEnv): Promise<void> {
  if (!env.BUILDIN_BOT_TOKEN) {
    throw new Error('BUILDIN_BOT_TOKEN is required for stdio transport mode');
  }

  const client = new BuildinClient(env.BUILDIN_BOT_TOKEN);
  const server = createMcpServer(client);

  logger.info('All tools registered, connecting stdio transport...');

  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info('buildin-mcp server running on stdio');
}

async function startHttpServer(config: AppConfig, env: AppEnv): Promise<void> {
  const port = env.HTTP_PORT ?? config.http.port;
  const path = config.http.path;

  const httpServer = createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

    if (req.method === 'OPTIONS') {
      res.writeHead(204).end();
      return;
    }

    const url = new URL(req.url ?? '/', `http://localhost:${port}`);

    if (url.pathname !== path) {
      res.writeHead(404).end(JSON.stringify({ error: 'Not found' }));
      return;
    }

    if (req.method === 'GET' || req.method === 'DELETE') {
      res.writeHead(405).end(JSON.stringify({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Method not allowed.' },
        id: null,
      }));
      return;
    }

    if (req.method !== 'POST') {
      res.writeHead(405).end();
      return;
    }

    // Extract token from query param
    const token = url.searchParams.get('token');
    if (!token) {
      res.writeHead(401).end(JSON.stringify({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Missing token query parameter. Use ?token=YOUR_BUILDIN_BOT_TOKEN' },
        id: null,
      }));
      return;
    }

    // Read request body
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk as Buffer);
    }
    const body = JSON.parse(Buffer.concat(chunks).toString());

    // Create per-request server with the user's token
    const client = new BuildinClient(token);
    const server = createMcpServer(client);

    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined, // stateless
      });

      await server.connect(transport);
      await transport.handleRequest(req, res, body);

      res.on('close', () => {
        transport.close();
        server.close();
      });
    } catch (error) {
      logger.error('Error handling MCP request', undefined, error);
      if (!res.headersSent) {
        res.writeHead(500).end(JSON.stringify({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal server error' },
          id: null,
        }));
      }
    }
  });

  httpServer.listen(port, () => {
    logger.info(`buildin-mcp HTTP server listening on port ${port}, path: ${path}`);
    logger.info(`Connect with: { "type": "http", "url": "http://localhost:${port}${path}?token=YOUR_TOKEN" }`);
  });
}

async function main(): Promise<void> {
  const config = getConfig();
  const env = getEnv();

  logger.info('Starting buildin-mcp server', undefined, {
    version: '1.0.0',
    apiBaseUrl: config.api.base_url,
    transportMode: env.TRANSPORT_MODE,
    logLevel: env.LOG_LEVEL ?? config.logging.default_level,
    nodeEnv: env.NODE_ENV,
  });

  if (env.TRANSPORT_MODE === 'http') {
    await startHttpServer(config, env);
  } else {
    await startStdioServer(env);
  }
}

main().catch((error) => {
  logger.error('Fatal error during startup', undefined, error);
  process.exit(1);
});
