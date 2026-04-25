import type { LogLevel, ToolContext } from '../types/tools.js';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  correlationId?: string;
  callChain?: string;
  context?: string;
  message: string;
  data?: unknown;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
    status?: number;
  };
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getCurrentLevel(): LogLevel {
  const envLevel = process.env['LOG_LEVEL']?.toLowerCase();
  if (envLevel && envLevel in LEVEL_PRIORITY) return envLevel as LogLevel;
  return 'info';
}

function isProduction(): boolean {
  return process.env['NODE_ENV'] !== 'development';
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[getCurrentLevel()];
}

function formatDev(entry: LogEntry): string {
  const parts: string[] = [];
  parts.push(`[${entry.level.toUpperCase().padEnd(5)}]`);
  parts.push(`[${entry.timestamp}]`);
  if (entry.correlationId) parts.push(`[req:${entry.correlationId}]`);
  if (entry.callChain) parts.push(`[${entry.callChain}]`);
  if (entry.context) parts.push(`[${entry.context}]`);
  parts.push(entry.message);
  if (entry.data) parts.push(`| ${JSON.stringify(entry.data)}`);
  if (entry.error) {
    parts.push(`| error: ${entry.error.name}: ${entry.error.message}`);
    if (entry.error.code) parts.push(`(code: ${entry.error.code})`);
    if (entry.error.status) parts.push(`(status: ${entry.error.status})`);
  }
  return parts.join(' ');
}

function write(level: LogLevel, message: string, ctx?: Partial<ToolContext>, data?: unknown, error?: unknown): void {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (ctx?.correlationId) entry.correlationId = ctx.correlationId;
  if (ctx?.callChain?.length) entry.callChain = ctx.callChain.join(' → ');
  if (ctx?.toolName) entry.context = ctx.toolName;
  if (data !== undefined) entry.data = data;

  if (error instanceof Error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
    // Attach extra fields from BuildinApiError
    const anyErr = error as unknown as Record<string, unknown>;
    if (anyErr['code']) entry.error.code = String(anyErr['code']);
    if (anyErr['status']) entry.error.status = Number(anyErr['status']);
  }

  const output = isProduction() ? JSON.stringify(entry) : formatDev(entry);

  // MCP servers use stdout for protocol; use stderr for logs
  process.stderr.write(output + '\n');
}

export const logger = {
  debug: (message: string, ctx?: Partial<ToolContext>, data?: unknown) =>
    write('debug', message, ctx, data),

  info: (message: string, ctx?: Partial<ToolContext>, data?: unknown) =>
    write('info', message, ctx, data),

  warn: (message: string, ctx?: Partial<ToolContext>, data?: unknown) =>
    write('warn', message, ctx, data),

  error: (message: string, ctx?: Partial<ToolContext>, error?: unknown, data?: unknown) =>
    write('error', message, ctx, data, error),

  // Create a child context with an added call chain step
  child: (ctx: Partial<ToolContext>, step: string): Partial<ToolContext> => ({
    ...ctx,
    callChain: [...(ctx.callChain ?? []), step],
  }),
};

export function generateCorrelationId(): string {
  return Math.random().toString(36).substring(2, 10);
}
