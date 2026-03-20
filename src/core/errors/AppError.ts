export type ErrorCode =
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_TOKEN_EXPIRED'
  | 'AUTH_UNAUTHORIZED'
  | 'PLAN_EXPIRED'
  | 'PLAN_UPGRADE_REQUIRED'
  | 'STREAM_URL_INVALID'
  | 'STREAM_UNAVAILABLE'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}
