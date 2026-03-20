const { verifyAccessToken } = require('../services/token.service');
const { fail } = require('../utils/response');
const db = require('../database');

/**
 * Middleware: verify Bearer token and attach req.user.
 */
function requireAuth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return fail(res, 'AUTH_TOKEN_REQUIRED', 'Se requiere autenticación', 401);
  }

  const token = header.slice(7);
  try {
    const payload = verifyAccessToken(token);
    // Load fresh user from DB so revoked / deleted users are rejected
    const user = db
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(payload.id);

    if (!user) {
      return fail(res, 'AUTH_TOKEN_EXPIRED', 'La sesión ha expirado', 401);
    }

    req.user = user;
    next();
  } catch {
    return fail(res, 'AUTH_TOKEN_EXPIRED', 'La sesión ha expirado. Por favor inicia sesión nuevamente.', 401);
  }
}

/**
 * Middleware: only allow superadmin or admin users.
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return fail(res, 'AUTH_TOKEN_REQUIRED', 'Se requiere autenticación', 401);
  }
  if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
    return fail(res, 'AUTH_UNAUTHORIZED', 'No tienes permisos para realizar esta acción.', 403);
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
