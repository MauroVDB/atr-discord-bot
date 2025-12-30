const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'weeklyPollData.db');
const db = new Database(dbPath);

db.prepare(`
CREATE TABLE IF NOT EXISTS polls (
    id TEXT PRIMARY KEY,
    data TEXT
)
`).run();

function loadPollData() {
  const rows = db.prepare('SELECT * FROM polls').all();
  const result = {};
  for (const row of rows) {
    result[row.id] = JSON.parse(row.data);
  }
  return result;
}

function savePollData(data) {
  const stmt = db.prepare(`
        INSERT INTO polls (id, data)
        VALUES (@id, @data)
        ON CONFLICT(id) DO UPDATE SET
            data = excluded.data
    `);

  for (const id in data) {
    stmt.run({
      id,
      data: JSON.stringify(data[id])
    });
  }
}

module.exports = { loadPollData, savePollData };