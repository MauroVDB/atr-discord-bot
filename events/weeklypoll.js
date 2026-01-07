const cron = require('node-cron');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { loadPollData, savePollData } = require('../functions/pollStorage');

// Poll data
const options = [
  { label: 'Tanking', emoji: '🎫' },
  { label: 'Partisaning', emoji: '😢' },
  { label: 'Artillery', emoji: '🛡️' },
  { label: 'Airborn', emoji: '✈️' },
  { label: 'Naval', emoji: '⚓' }
];

const rawData = loadPollData();
const voteTrackerPoll = new Map(
  Object.entries(rawData).map(([msgId, votes]) => [
    msgId,
    new Map(Object.entries(votes))
  ])
);

function makeBar(percentage, size = 20) {
  const filled = Math.round((percentage / 100) * size);
  const empty = size - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}
module.exports = {
  start: async (client, channelId) => {
    //Syntax: minute hour day-of-month month day-of-week
    cron.schedule('0 12 * * 0', async () => {
      const channel = await client.channels.fetch(channelId);
      if (!channel) return console.error('Channel not found for weekly poll.');
      voteTrackerPoll.clear();
      const row = new ActionRowBuilder();
      options.forEach((opt, i) => {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`weekly_vote_${i}`)
            .setLabel(`${opt.label}`)
            .setStyle(ButtonStyle.Primary)
            .setEmoji(opt.emoji)
        );
      });

      let description = 'Vote for the operation you wish to see next!\n\n';

      options.forEach(opt => {
        description += `**${opt.label}**\n`;
        description += `\`${makeBar(0)}\` **0.0%** (0)\n\n`;
      });

      description += '🏆 **Current winner:** —';

      const embed = new EmbedBuilder()
        .setTitle('🗳️ Weekly Operations Demands')
        .setDescription(description)
        .setColor('#DBB434');

      await channel.bulkDelete(10).catch(() => { });

      const message = await channel.send({ embeds: [embed], components: [row] });
      voteTrackerPoll.set(message.id, new Map());
      savePollData({
        [message.id]: {}
      })

      console.log('Weekly poll sent.');

    }, {
      timezone: 'Europe/Brussels'
    });

  },
  voteTrackerPoll,
  options,
};
