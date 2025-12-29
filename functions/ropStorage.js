const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../database/ropVotes.json');

function loadRopVotes() {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveRopVotes(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = { loadRopVotes, saveRopVotes };