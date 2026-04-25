# buildin-mcp

MCP (Model Context Protocol) server providing full access to the Buildin.ai API.

## Project Overview

This MCP server exposes all Buildin.ai REST API capabilities as MCP tools, enabling AI assistants like Claude to interact with Buildin.ai workspaces.

**Stack:** TypeScript, MCP SDK (`@modelcontextprotocol/sdk`), Zod, Vitest

**API Coverage:** 18 tools covering Pages, Blocks, Databases, Search, and Users APIs.

## Directory Structure

```
src/
├── index.ts              # Entry point: MCP server init + stdio transport
├── config/
│   └── index.ts          # Loads config.yaml + validates .env via Zod
├── client/
│   └── buildin-client.ts # Single HTTP client: auth, retry, rate-limit, error mapping
├── tools/
│   ├── index.ts          # Registers all tools on the MCP server
│   ├── pages.ts          # create_page, get_page, update_page
│   ├── blocks.ts         # get_block, get_block_children, append_block_children, update_block, delete_block
│   ├── databases.ts      # create_database, get_database, update_database, query_database
│   ├── search.ts         # search
│   └── users.ts          # get_me
├── types/
│   ├── api.ts            # All Buildin API types (Page, Block, Database, RichText, etc.)
│   └── tools.ts          # MCP tool input/output types
└── utils/
    ├── errors.ts         # BuildinApiError class with code, status, message
    ├── logger.ts         # Structured logger with correlationId and call chain tracing
    └── retry.ts          # Exponential backoff retry utility
```

## Configuration

**`config.yaml`** — non-secret constants: timeouts, retry policy, rate limits, pagination, HTTP server defaults.
**`.env`** — runtime settings (never commit this file):
- `TRANSPORT_MODE` — `stdio` (local, single-user) or `http` (remote, multi-tenant). Default: `stdio`
- `BUILDIN_BOT_TOKEN` — your Buildin.ai bot token (required for stdio mode; for http mode, token comes from client URL)
- `HTTP_PORT` — port for HTTP server (default: 3000)
- `LOG_LEVEL` — log level: debug | info | warn | error (default: info)
- `NODE_ENV` — development | production (affects log format)

### Transport Modes

**stdio** — local single-user mode. Token from env. Used with Claude Desktop `command` config.
**http** — remote multi-tenant mode. Each user passes their own token via URL query param. No tokens stored on server.

## Commands

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript → dist/
npm start            # Run the MCP server (stdio transport)
npm test             # Run unit tests
npm run test:coverage # Run tests with coverage report (target: >80%)
npm run lint         # TypeScript type checking
```

## Docker

```bash
docker build -t buildin-mcp .
docker-compose up
```

Docker compose runs in **http** mode by default (multi-tenant, port 3000).

## Claude Integration

### Option 1: Local stdio mode
```json
{
  "mcpServers": {
    "buildin": {
      "command": "node",
      "args": ["/path/to/buildin-mcp/dist/index.js"],
      "env": {
        "BUILDIN_BOT_TOKEN": "your_token_here"
      }
    }
  }
}
```

### Option 2: Remote HTTP mode (multi-tenant)
```json
{
  "mcpServers": {
    "buildin": {
      "type": "http",
      "url": "https://your-server.com/mcp?token=YOUR_BUILDIN_BOT_TOKEN"
    }
  }
}
```

### Option 3: Docker stdio
```json
{
  "mcpServers": {
    "buildin": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "-e", "BUILDIN_BOT_TOKEN=your_token", "buildin-mcp"]
    }
  }
}
```

## Adding a New Tool

1. Choose or create the appropriate file in `src/tools/` (pages, blocks, databases, search, users)
2. Define the Zod input schema
3. Implement the handler calling `BuildinClient`
4. Export the tool registration function
5. Import and call it in `src/tools/index.ts`
6. Write tests in `tests/unit/tools/`

## Adding a New Block Type

1. Add the type to `BLOCK_TYPES` constant in `src/types/api.ts`
2. Add the data schema to `BlockDataSchema` in `src/types/api.ts`
3. Update the block input schema in `src/tools/blocks.ts`
4. Add a test case in `tests/unit/tools/blocks.test.ts`

## Updating for API Changes

1. Check `docs/buildin-developer-guide/` for updated documentation
2. Update types in `src/types/api.ts`
3. Update the affected tool in `src/tools/`
4. Update `BuildinClient` if endpoint paths or request formats changed
5. Run `npm test` to catch regressions
6. Update `docs/buildin-developer-guide/` with new docs if needed

## Architecture Decisions

- **Single HTTP client** (`BuildinClient`) — all API calls go through one place for consistent auth, retry, and error handling
- **Zod schemas** — runtime validation of all tool inputs, provides type safety and clear error messages
- **correlationId** — unique ID generated per tool call, threaded through all nested calls for traceable error logs
- **config.yaml** — all tunable constants externalized, never hardcoded
- **Layered errors** — `BuildinApiError` maps HTTP status codes to meaningful codes (not_found, forbidden, rate_limit, etc.)
