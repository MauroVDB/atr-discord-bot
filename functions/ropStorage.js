const Database = require('better-sqlite3');
const path = require('path');

const db = new Database('./data/rop.db');

db.prepare(`
CREATE TABLE IF NOT EXISTS votes (
    messageId TEXT PRIMARY KEY,
    data TEXT
)
`).run();

function loadRopVotes() {
    const rows = db.prepare('SELECT * FROM votes').all();
    const result = {};
    for (const row of rows) {
        result[row.messageId] = JSON.parse(row.data);
    }
    return result;
}

function saveRopVotes(data) {
    const stmt = db.prepare(`
        INSERT INTO votes (messageId, data)
        VALUES (@messageId, @data)
        ON CONFLICT(messageId) DO UPDATE SET
            data = excluded.data
    `);

    for (const messageId in data) {
        stmt.run({
            messageId,
            data: JSON.stringify(data[messageId])
        });
    }
}

module.exports = { loadRopVotes, saveRopVotes };