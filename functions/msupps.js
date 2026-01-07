// const Database = require('better-sqlite3');
// const db = new Database('./data/msupps.db');

// db.prepare(`
//   CREATE TABLE IF NOT EXISTS maintenance_tunnels (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     location TEXT NOT NULL,
//     burn_rate_per_hour REAL NOT NULL,
//     current_stock REAL NOT NULL DEFAULT 0,
//     last_updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
//     added_by TEXT NOT NULL,
//     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
//   )
// `).run();

// module.exports = db;