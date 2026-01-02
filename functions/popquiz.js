const Database = require('better-sqlite3');
const db = new Database('./data/popquiz.db');

// Tabel aanmaken als die nog niet bestaat
db.prepare(`
  CREATE TABLE IF NOT EXISTS leaderboard (
    userId TEXT PRIMARY KEY,
    username TEXT,
    score INTEGER
  )
`).run();

function addScore(userId, username) {
  const existing = db.prepare('SELECT score FROM leaderboard WHERE userId = ?').get(userId);
  if (existing) {
    db.prepare('UPDATE leaderboard SET score = score + 1 WHERE userId = ?').run(userId);
  } else {
    db.prepare('INSERT INTO leaderboard(userId, username, score) VALUES (?, ?, 1)').run(userId, username);
  }
}

function getLeaderboard() {
  return db.prepare('SELECT userId, score FROM leaderboard ORDER BY score DESC LIMIT 10').all();
}

module.exports = { addScore, getLeaderboard };