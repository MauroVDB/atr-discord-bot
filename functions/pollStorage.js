const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../database/weeklyPollData.json');

function loadPollData() {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function savePollData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = { loadPollData, savePollData };