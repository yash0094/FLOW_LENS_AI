const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'flowlens.sqlite'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  google_id TEXT UNIQUE,
  google_access_token TEXT,
  google_refresh_token TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user', -- 'admin' | 'user'
  z_threshold REAL NOT NULL DEFAULT 1.0,
  has_seen_tutorial INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS datasets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'upload', -- 'upload' | 'sheets'
  row_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dataset_id TEXT NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  stage TEXT NOT NULL,
  entry_time TEXT NOT NULL,
  exit_time TEXT NOT NULL,
  duration_seconds REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS analyses (
  id TEXT PRIMARY KEY,
  dataset_id TEXT NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  result_json TEXT NOT NULL,
  z_threshold REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_records_dataset ON records(dataset_id);
CREATE INDEX IF NOT EXISTS idx_datasets_user ON datasets(user_id);
`);

module.exports = db;
