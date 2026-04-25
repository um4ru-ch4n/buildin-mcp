import { getConfig, getEnv } from '../config/index.js';
import { BuildinApiError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { withRetry } from '../utils/retry.js';
import type { ApiErrorResponse } from '../types/api.js';
import type { ToolContext } from '../types/tools.js';

export class BuildinClient {
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly timeoutMs: number;

  constructor() {
    const config = getConfig();
    const env = getEnv();
    this.baseUrl = config.api.base_url;
    this.token = env.BUILDIN_BOT_TOKEN;
    this.timeoutMs = config.api.timeout_ms;
  }

  async get<T>(path: string, ctx: Partial<ToolContext>): Promise<T> {
    return this.request<T>('GET', path, undefined, ctx);
  }

  async post<T>(path: string, body: unknown, ctx: Partial<ToolContext>): Promise<T> {
    return this.request<T>('POST', path, body, ctx);
  }

  async patch<T>(path: string, body: unknown, ctx: Partial<ToolContext>): Promise<T> {
    return this.request<T>('PATCH', path, body, ctx);
  }

  async delete<T>(path: string, ctx: Partial<ToolContext>): Promise<T> {
    return this.request<T>('DELETE', path, undefined, ctx);
  }

  private async request<T>(
    method: string,
    path: string,
    body: unknown,
    ctx: Partial<ToolContext>,
  ): Promise<T> {
    const config = getConfig();
    const retryConfig = {
      maxAttempts: config.retry.max_attempts,
      initialDelayMs: config.retry.initial_delay_ms,
      backoffMultiplier: config.retry.backoff_multiplier,
      maxDelayMs: config.retry.max_delay_ms,
    };

    const clientCtx = logger.child(ctx, `BuildinClient.${method.toLowerCase()}`);
    const url = `${this.baseUrl}${path}`;

    logger.debug(`${method} ${path}`, clientCtx, { url });

    return withRetry(
      () => this.executeRequest<T>(method, url, body, clientCtx),
      retryConfig,
      clientCtx,
      `${method} ${path}`,
    );
  }

  private async executeRequest<T>(
    method: string,
    url: string,
    body: unknown,
    ctx: Partial<ToolContext>,
  ): Promise<T> {
    const fetchCtx = logger.child(ctx, 'fetch');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData: ApiErrorResponse | undefined;
        try {
          errorData = (await response.json()) as ApiErrorResponse;
        } catch {
          // ignore parse errors
        }

        const error = errorData?.object === 'error'
          ? BuildinApiError.fromApiResponse(errorData)
          : BuildinApiError.fromHttpStatus(response.status, `HTTP ${response.status}: ${response.statusText}`);

        logger.error(
          `Request failed: ${error.code} (${error.status})`,
          fetchCtx,
          error,
          { url, method },
        );

        throw error;
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      const data = (await response.json()) as T;
      logger.debug(`Request succeeded`, fetchCtx, { status: response.status });
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof BuildinApiError) throw error;

      // Network errors, timeouts, etc.
      const networkError = new BuildinApiError(
        error instanceof Error ? error.message : 'Network request failed',
        'network_error',
        0,
      );

      logger.error('Network error', fetchCtx, networkError, { url, method });
      throw networkError;
    }
  }
}
