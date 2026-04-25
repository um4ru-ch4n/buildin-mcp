export interface ToolContext {
  correlationId: string;
  toolName: string;
  callChain: string[];
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
