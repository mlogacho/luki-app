const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { ok, fail } = require('../utils/response');
const { generateTempPassword } = require('../utils/password');
const { sendWelcomeEmail } = require('../services/email.service');

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

// ─── GET /users ───────────────────────────────────────────────────────────────

function getUsers(req, res) {
  const rows = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
  return ok(res, rows.map(toUser));
}

// ─── GET /users/:id ──────────────────────────────────────────────────────────

function getUserById(req, res) {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!row) return fail(res, 'NOT_FOUND', 'Usuario no encontrado', 404);
  return ok(res, toUser(row));
}

// ─── POST /users ─────────────────────────────────────────────────────────────

async function createUser(req, res) {
  const { name, email, role = 'subscriber', planId = 'basic' } = req.body;

  if (!name || !name.trim()) {
    return fail(res, 'VALIDATION_ERROR', 'El nombre es requerido', 400);
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return fail(res, 'VALIDATION_ERROR', 'El correo electrónico no es válido', 400);
  }

  const allowedRoles = ['superadmin', 'admin', 'reseller', 'subscriber', 'guest'];
  if (!allowedRoles.includes(role)) {
    return fail(res, 'VALIDATION_ERROR', 'Rol inválido', 400);
  }

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (exists) {
    return fail(res, 'CONFLICT', 'Ya existe un usuario con ese correo', 409);
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);
  const id = uuidv4();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, plan_id, must_change_password, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 1, ?)
  `).run(id, name.trim(), email.toLowerCase().trim(), passwordHash, role, planId, now);

  const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);

  // Send welcome email (non-blocking — log on failure)
  sendWelcomeEmail({ name: name.trim(), email: email.toLowerCase().trim(), tempPassword })
    .catch((err) => console.error('[email] Failed to send welcome email:', err.message));

  return ok(res, toUser(newUser), 'Usuario creado exitosamente', 201);
}

// ─── PUT /users/:id ──────────────────────────────────────────────────────────

function updateUser(req, res) {
  const { name, role, planId } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return fail(res, 'NOT_FOUND', 'Usuario no encontrado', 404);

  const allowedRoles = ['superadmin', 'admin', 'reseller', 'subscriber', 'guest'];
  if (role && !allowedRoles.includes(role)) {
    return fail(res, 'VALIDATION_ERROR', 'Rol inválido', 400);
  }

  const updatedName = name !== undefined ? name.trim() || user.name : user.name;
  const updatedRole = role || user.role;
  const updatedPlanId = planId || user.plan_id;

  db.prepare(
    'UPDATE users SET name = ?, role = ?, plan_id = ? WHERE id = ?'
  ).run(updatedName, updatedRole, updatedPlanId, user.id);

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  return ok(res, toUser(updated));
}

// ─── DELETE /users/:id ───────────────────────────────────────────────────────

function deleteUser(req, res) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return fail(res, 'NOT_FOUND', 'Usuario no encontrado', 404);

  // Prevent self-deletion
  if (req.user && req.user.id === req.params.id) {
    return fail(res, 'FORBIDDEN', 'No puedes eliminar tu propia cuenta', 403);
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  return res.status(204).send();
}

// ─── POST /users/:id/resend-welcome ──────────────────────────────────────────

async function resendWelcomeEmail(req, res) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return fail(res, 'NOT_FOUND', 'Usuario no encontrado', 404);

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  db.prepare(
    'UPDATE users SET password_hash = ?, must_change_password = 1 WHERE id = ?'
  ).run(passwordHash, user.id);

  await sendWelcomeEmail({ name: user.name, email: user.email, tempPassword });

  return ok(res, null, 'Email de bienvenida reenviado');
}

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser, resendWelcomeEmail };
