const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../database/reactionRoles.json');

function loadRoles() {
  if (!fs.existsSync(filePath)) {return { messages: {} }};

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // 🔒 backward compatibility
  if (!data.messages) {
    data.messages = {};
  }

  return data;
}

function saveRoles(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = { loadRoles, saveRoles };