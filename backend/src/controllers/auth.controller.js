const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../services/token.service');
const { ok, fail } = require('../utils/response');
const config = require('../config');

/** Map a DB row to the User shape the app expects */
function toUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    planId: row.plan_id,
    avatar: row.avatar || undefined,
    activeProfileId: row.active_profile_id || undefined,
    mustChangePassword: row.must_change_password === 1,
    createdAt: row.created_at,
  };
}

// ─── POST /auth/login ────────────────────────────────────────────────────────

async function login(req, res) {
  const { email, password, deviceId = '' } = req.body;

  if (!email || !password) {
    return fail(res, 'AUTH_INVALID_CREDENTIALS', 'Email y contraseña son requeridos', 400);
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user) {
    return fail(res, 'AUTH_INVALID_CREDENTIALS', 'Credenciales incorrectas', 401);
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return fail(res, 'AUTH_INVALID_CREDENTIALS', 'Credenciales incorrectas', 401);
  }

  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id });

  const expiresAt = new Date(
    Date.now() + config.JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  db.prepare(
    'INSERT INTO refresh_tokens (token, user_id, device_id, expires_at) VALUES (?, ?, ?, ?)'
  ).run(refreshToken, user.id, deviceId, expiresAt);

  return ok(res, { accessToken, refreshToken, user: toUser(user) });
}

// ─── POST /auth/logout ───────────────────────────────────────────────────────

function logout(req, res) {
  const { refreshToken } = req.body;
  if (refreshToken) {
    db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);
  }
  return ok(res, null, 'Sesión cerrada');
}

// ─── POST /auth/refresh ──────────────────────────────────────────────────────

async function refresh(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return fail(res, 'AUTH_TOKEN_REQUIRED', 'Refresh token requerido', 400);
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    return fail(res, 'AUTH_TOKEN_EXPIRED', 'Refresh token inválido o expirado', 401);
  }

  const stored = db
    .prepare('SELECT * FROM refresh_tokens WHERE token = ?')
    .get(refreshToken);

  if (!stored || new Date(stored.expires_at) < new Date()) {
    return fail(res, 'AUTH_TOKEN_EXPIRED', 'Refresh token inválido o expirado', 401);
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.id);
  if (!user) {
    return fail(res, 'AUTH_TOKEN_EXPIRED', 'La sesión ha expirado', 401);
  }

  // Rotate refresh token
  db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);

  const newAccessToken = signAccessToken({ id: user.id, role: user.role });
  const newRefreshToken = signRefreshToken({ id: user.id });

  const expiresAt = new Date(
    Date.now() + config.JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  db.prepare(
    'INSERT INTO refresh_tokens (token, user_id, device_id, expires_at) VALUES (?, ?, ?, ?)'
  ).run(newRefreshToken, user.id, stored.device_id, expiresAt);

  return ok(res, { accessToken: newAccessToken, refreshToken: newRefreshToken });
}

// ─── GET /auth/me ────────────────────────────────────────────────────────────

function getMe(req, res) {
  return ok(res, toUser(req.user));
}

// ─── POST /auth/change-password ──────────────────────────────────────────────

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return fail(res, 'AUTH_INVALID_CREDENTIALS', 'Contraseñas requeridas', 400);
  }

  if (newPassword.length < 6) {
    return fail(
      res,
      'AUTH_INVALID_CREDENTIALS',
      'La nueva contraseña debe tener al menos 6 caracteres',
      400
    );
  }

  if (currentPassword === newPassword) {
    return fail(
      res,
      'AUTH_INVALID_CREDENTIALS',
      'La nueva contraseña debe ser diferente a la actual',
      400
    );
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) {
    return fail(res, 'AUTH_INVALID_CREDENTIALS', 'La contraseña actual es incorrecta', 401);
  }

  const hash = await bcrypt.hash(newPassword, 12);
  db.prepare(
    'UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?'
  ).run(hash, user.id);

  return ok(res, null, 'Contraseña actualizada');
}

module.exports = { login, logout, refresh, getMe, changePassword };
