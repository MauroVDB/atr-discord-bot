const Database = require('better-sqlite3');
const db = new Database('./database/weeklyPollData.db');

db.prepare(`
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    channelId TEXT,
    messageId TEXT,
    type TEXT,
    roles TEXT,
    users TEXT
)
`).run();

function loadPollData() {
  const rows = db.prepare('SELECT * FROM messages').all();
  const data = { messages: {} };
  for (const row of rows) {
    data.messages[row.id] = {
      channelId: row.channelId,
      messageId: row.messageId,
      type: row.type,
      roles: JSON.parse(row.roles),
      users: JSON.parse(row.users)
    };
  }
  return data;
}

function savePollData(data) {
  const stmt = db.prepare(`
        INSERT INTO messages (id, channelId, messageId, type, roles, users)
        VALUES (@id, @channelId, @messageId, @type, @roles, @users)
        ON CONFLICT(id) DO UPDATE SET
            channelId = excluded.channelId,
            messageId = excluded.messageId,
            type = excluded.type,
            roles = excluded.roles,
            users = excluded.users
    `);
  for (const id in data.messages) {
    stmt.run({
      id,
      channelId: data.messages[id].channelId,
      messageId: data.messages[id].messageId,
      type: data.messages[id].type,
      roles: JSON.stringify(data.messages[id].roles),
      users: JSON.stringify(data.messages[id].users)
    });
  }
}

module.exports = { loadPollData, savePollData };