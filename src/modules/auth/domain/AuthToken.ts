/**
 * Domain entity representing an authenticated session token pair.
 */
export interface AuthToken {
  accessToken: string;
  refreshToken: string;
}

export function isAuthToken(value: unknown): value is AuthToken {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as AuthToken).accessToken === 'string' &&
    typeof (value as AuthToken).refreshToken === 'string'
  );
}
