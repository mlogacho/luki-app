const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Sign a short-lived access token.
 * @param {{ id: string, role: string }} payload
 */
function signAccessToken(payload) {
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRES_IN,
  });
}

/**
 * Sign a long-lived refresh token.
 * @param {{ id: string }} payload
 */
function signRefreshToken(payload) {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
  });
}

/**
 * Verify an access token. Returns the decoded payload or throws.
 * @param {string} token
 */
function verifyAccessToken(token) {
  return jwt.verify(token, config.JWT_ACCESS_SECRET);
}

/**
 * Verify a refresh token. Returns the decoded payload or throws.
 * @param {string} token
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, config.JWT_REFRESH_SECRET);
}

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };
