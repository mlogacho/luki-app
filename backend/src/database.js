const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const config = require('./config');

const dbDir = path.dirname(path.resolve(config.DB_PATH));
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.resolve(config.DB_PATH));

// WAL mode: allows concurrent reads while a write is in progress — safe on EC2 EBS volumes.
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Schema ─────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id                   TEXT PRIMARY KEY,
    name                 TEXT NOT NULL,
    email                TEXT UNIQUE NOT NULL,
    password_hash        TEXT NOT NULL,
    role                 TEXT NOT NULL DEFAULT 'subscriber',
    plan_id              TEXT NOT NULL DEFAULT 'basic',
    avatar               TEXT,
    active_profile_id    TEXT,
    must_change_password INTEGER NOT NULL DEFAULT 0,
    created_at           TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS refresh_tokens (
    token       TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL,
    device_id   TEXT NOT NULL DEFAULT '',
    expires_at  TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS profiles (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL,
    name       TEXT NOT NULL,
    avatar_url TEXT,
    has_pin    INTEGER NOT NULL DEFAULT 0,
    is_kids    INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS channels (
    id               TEXT PRIMARY KEY,
    title            TEXT NOT NULL,
    description      TEXT NOT NULL DEFAULT '',
    image_url        TEXT NOT NULL DEFAULT '',
    video_url        TEXT NOT NULL,
    tags             TEXT NOT NULL DEFAULT '[]',
    category         TEXT NOT NULL DEFAULT '',
    is_active        INTEGER NOT NULL DEFAULT 1,
    allowed_plan_ids TEXT NOT NULL DEFAULT '[]',
    created_at       TEXT NOT NULL,
    updated_at       TEXT NOT NULL
  );
`);

module.exports = db;
