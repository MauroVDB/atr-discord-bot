const { SlashCommandBuilder } = require('discord.js');

const { getLeaderboard } = require('../functions/popquiz'); // split data/logica

const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Show the leaderboard of the pop quiz!'),
    async execute(interaction) {
        const leaderboard = getLeaderboard();

        const embed = new EmbedBuilder()
            .setTitle('🏆 | Leaderboard')
            .setDescription(leaderboard
                .map((row, index) => `${index + 1}. <@${row.userId}> - ${row.score}`)
                .join('\n')
            )
            .setColor('#DBB434')

        await interaction.reply({ embeds: [embed] });
    },
};