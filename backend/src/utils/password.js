const crypto = require('crypto');

/**
 * Generate a random temporary password: 10 chars mixing letters, digits and symbols.
 * Avoids ambiguous characters (0, O, l, I) for better readability in emails.
 */
function generateTempPassword(length = 10) {
  const charset = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#';
  let password = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += charset[bytes[i] % charset.length];
  }
  return password;
}

module.exports = { generateTempPassword };
