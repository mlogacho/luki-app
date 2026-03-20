/**
 * Decodes the payload of a JWT token without verifying the signature.
 * Signature verification must be done on the server side.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Returns the expiration timestamp (ms) from a JWT, or null if not present.
 */
export function getTokenExpiry(token: string): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload['exp'] !== 'number') return null;
  return payload['exp'] * 1000;
}

/**
 * Returns true if the token expires within the given threshold (ms).
 */
export function isTokenExpiringSoon(token: string, thresholdMs: number): boolean {
  const expiry = getTokenExpiry(token);
  if (expiry === null) return true;
  return expiry - Date.now() < thresholdMs;
}

/**
 * Returns true if the token is expired.
 */
export function isTokenExpired(token: string): boolean {
  const expiry = getTokenExpiry(token);
  if (expiry === null) return true;
  return Date.now() >= expiry;
}
