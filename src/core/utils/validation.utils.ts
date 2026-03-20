/**
 * Validates that an email address has a valid format.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates that a password meets minimum requirements (at least 6 characters).
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * Validates that a string is not empty after trimming.
 */
export function isNonEmptyString(value: string): boolean {
  return value.trim().length > 0;
}
