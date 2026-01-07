const Database = require('better-sqlite3');
const path = require('path');

const db = new Database('./data/services.db');

db.prepare(`
CREATE TABLE IF NOT EXISTS order_joins (
  channel_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  order_id INTEGER,
  regiment_player TEXT,
  PRIMARY KEY(channel_id, user_id)
)
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS orders (
  order_id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  regiment_player TEXT,
  order_text TEXT,
  destination TEXT,
  facility_msg_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS lendlease_joins (
  channel_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  order_id INTEGER,
  regiment_player TEXT,
  PRIMARY KEY(channel_id, user_id)
)
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS lendlease (
  order_id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  regiment_player TEXT,
  order_text TEXT,
  destination TEXT,
  facility_msg_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`).run();

module.exports = db;