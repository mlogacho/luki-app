const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { ok, fail } = require('../utils/response');

function toChannel(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    videoUrl: row.video_url,
    tags: JSON.parse(row.tags || '[]'),
    category: row.category,
    isActive: row.is_active === 1,
    allowedPlanIds: JSON.parse(row.allowed_plan_ids || '[]'),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── GET /channels ────────────────────────────────────────────────────────────

function getChannels(req, res) {
  const rows = db
    .prepare('SELECT * FROM channels WHERE is_active = 1 ORDER BY created_at DESC')
    .all();
  return ok(res, rows.map(toChannel));
}

// ─── GET /channels/:id ────────────────────────────────────────────────────────

function getChannelById(req, res) {
  const row = db.prepare('SELECT * FROM channels WHERE id = ?').get(req.params.id);
  if (!row) return fail(res, 'NOT_FOUND', 'Canal no encontrado', 404);
  return ok(res, toChannel(row));
}

// ─── POST /channels ───────────────────────────────────────────────────────────

function createChannel(req, res) {
  const { title, videoUrl, imageUrl = '', description = '', tags = [], category = '', allowedPlanIds = [] } = req.body;

  if (!title || !title.trim()) {
    return fail(res, 'VALIDATION_ERROR', 'El título es requerido', 400);
  }
  if (!videoUrl || !videoUrl.trim()) {
    return fail(res, 'VALIDATION_ERROR', 'La URL de video es requerida', 400);
  }

  const id = uuidv4();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO channels (id, title, description, image_url, video_url, tags, category, is_active, allowed_plan_ids, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
  `).run(
    id,
    title.trim(),
    description,
    imageUrl,
    videoUrl.trim(),
    JSON.stringify(Array.isArray(tags) ? tags : []),
    category,
    JSON.stringify(Array.isArray(allowedPlanIds) ? allowedPlanIds : []),
    now,
    now
  );

  const row = db.prepare('SELECT * FROM channels WHERE id = ?').get(id);
  return ok(res, toChannel(row), 'Canal creado', 201);
}

// ─── PUT /channels/:id ────────────────────────────────────────────────────────

function updateChannel(req, res) {
  const row = db.prepare('SELECT * FROM channels WHERE id = ?').get(req.params.id);
  if (!row) return fail(res, 'NOT_FOUND', 'Canal no encontrado', 404);

  const { title, videoUrl, imageUrl, description, tags, category, isActive, allowedPlanIds } = req.body;
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE channels SET
      title            = ?,
      description      = ?,
      image_url        = ?,
      video_url        = ?,
      tags             = ?,
      category         = ?,
      is_active        = ?,
      allowed_plan_ids = ?,
      updated_at       = ?
    WHERE id = ?
  `).run(
    title !== undefined ? title.trim() : row.title,
    description !== undefined ? description : row.description,
    imageUrl !== undefined ? imageUrl : row.image_url,
    videoUrl !== undefined ? videoUrl.trim() : row.video_url,
    tags !== undefined ? JSON.stringify(Array.isArray(tags) ? tags : []) : row.tags,
    category !== undefined ? category : row.category,
    isActive !== undefined ? (isActive ? 1 : 0) : row.is_active,
    allowedPlanIds !== undefined ? JSON.stringify(Array.isArray(allowedPlanIds) ? allowedPlanIds : []) : row.allowed_plan_ids,
    now,
    row.id
  );

  const updated = db.prepare('SELECT * FROM channels WHERE id = ?').get(row.id);
  return ok(res, toChannel(updated));
}

// ─── DELETE /channels/:id ─────────────────────────────────────────────────────

function deleteChannel(req, res) {
  const row = db.prepare('SELECT * FROM channels WHERE id = ?').get(req.params.id);
  if (!row) return fail(res, 'NOT_FOUND', 'Canal no encontrado', 404);

  db.prepare('DELETE FROM channels WHERE id = ?').run(req.params.id);
  return res.status(204).send();
}

module.exports = { getChannels, getChannelById, createChannel, updateChannel, deleteChannel };
