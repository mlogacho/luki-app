const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { ok, fail } = require('../utils/response');

function toProfile(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    avatarUrl: row.avatar_url || undefined,
    hasPin: row.has_pin === 1,
    isKids: row.is_kids === 1,
    createdAt: row.created_at,
  };
}

// ─── GET /profiles ────────────────────────────────────────────────────────────

function getProfiles(req, res) {
  const rows = db
    .prepare('SELECT * FROM profiles WHERE user_id = ? ORDER BY created_at ASC')
    .all(req.user.id);

  // If user has no profiles yet, create a default one
  if (rows.length === 0) {
    const id = uuidv4();
    const now = new Date().toISOString();
    db.prepare(
      'INSERT INTO profiles (id, user_id, name, has_pin, is_kids, created_at) VALUES (?, ?, ?, 0, 0, ?)'
    ).run(id, req.user.id, req.user.name, now);
    const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(id);
    return ok(res, [toProfile(profile)]);
  }

  return ok(res, rows.map(toProfile));
}

// ─── POST /profiles/select ────────────────────────────────────────────────────

function selectProfile(req, res) {
  const { profileId } = req.body;
  if (!profileId) {
    return fail(res, 'VALIDATION_ERROR', 'profileId es requerido', 400);
  }

  const profile = db
    .prepare('SELECT * FROM profiles WHERE id = ? AND user_id = ?')
    .get(profileId, req.user.id);

  if (!profile) {
    return fail(res, 'NOT_FOUND', 'Perfil no encontrado', 404);
  }

  // Update user's active profile
  db.prepare('UPDATE users SET active_profile_id = ? WHERE id = ?').run(profileId, req.user.id);

  return ok(res, toProfile(profile));
}

module.exports = { getProfiles, selectProfile };
