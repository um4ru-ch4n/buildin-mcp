import type { ApiErrorResponse } from '../types/api.js';

export type BuildinErrorCode =
  | 'validation_error'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'rate_limit'
  | 'server_error'
  | 'unsupported_block_type'
  | 'network_error'
  | 'unknown';

export class BuildinApiError extends Error {
  readonly code: BuildinErrorCode;
  readonly status: number;
  readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: BuildinErrorCode,
    status: number,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'BuildinApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  static fromApiResponse(response: ApiErrorResponse): BuildinApiError {
    const code = mapApiCodeToErrorCode(response.code);
    return new BuildinApiError(response.message, code, response.status, response.details);
  }

  static fromHttpStatus(status: number, message: string): BuildinApiError {
    const code = mapStatusToErrorCode(status);
    return new BuildinApiError(message, code, status);
  }

  isRetryable(): boolean {
    return this.status === 429 || this.status >= 500;
  }
}

function mapApiCodeToErrorCode(apiCode: string): BuildinErrorCode {
  const mapping: Record<string, BuildinErrorCode> = {
    validation_error: 'validation_error',
    unauthorized: 'unauthorized',
    forbidden: 'forbidden',
    not_found: 'not_found',
    rate_limit: 'rate_limit',
    internal_error: 'server_error',
    unsupported_block_type: 'unsupported_block_type',
  };
  return mapping[apiCode] ?? 'unknown';
}

function mapStatusToErrorCode(status: number): BuildinErrorCode {
  if (status === 400) return 'validation_error';
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 422) return 'unsupported_block_type';
  if (status === 429) return 'rate_limit';
  if (status >= 500) return 'server_error';
  return 'unknown';
}
