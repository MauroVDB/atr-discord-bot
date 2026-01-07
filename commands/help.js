const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');




module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get a list of all commands!'),
    async execute(interaction) {

        const channelPopQuiz = await interaction.client.channels.fetch(process.env.POPQUIZ_CHANNEL_ID);
        const channelRR = await interaction.client.channels.fetch(process.env.REACTION_ROLES_CHANNEL_ID);
        const channelServices = await interaction.client.channels.fetch(process.env.SERVICE_CHANNEL_ID);

        const embed = new EmbedBuilder()
            .setDescription(`# ⛑️ HELP
Hello, I am the official discord bot for 21st Athena Regiment! 
Here's a list of all avaible commands!

-# *🕵️ - Officer commands/functions*

## Commands
──────────────────────
- \`/rop\` Request an operation you would like to do with ATR.

- \`/leaderboard\` Check the current leaderboard for the daily pop quiz.

- \`/help\` Get this helpfull menu.

- 🕵️ \`/resetactivewar\` Resets the role "Active This War" for everyone after a war ends. 

## Functions
──────────────────────
- \`Verification\` New members can easily open a ticket to get verified. Roles are applied automatically after an officer verifies them.

- \`Welcome message\` A new message gets send when a new member joins the server.

- \`Popquiz\` A daily pop quiz will appear in ${channelPopQuiz} on a random time where you can try to be the first to answer correctly.

- \`Reactionroles\` You can apply roles of your interests in ${channelRR} .

- \`Services\` People outside of the regiment can request any *avaible* service in ${channelServices} .

- \`Voice channels\` The bot creates a new voice channel upon joining 1 of the 2 voice channels.

- \`Weekly poll\` You can vote on which weekly OP you would like to see this week.

-# Bot is created by <@318842023954219010>, feel free to dm me if  you have questions!
`)
            .setColor('#DBB434')

        await interaction.reply({ embeds: [embed], ephemeral: true },);
    },
};