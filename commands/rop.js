const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function interestBar(upvotes, downvotes, steps = 15) {
    const total = upvotes + downvotes;

    if (total === 0) {
        return "░".repeat(steps) + " 0%";
    }

    const percent = Math.round((upvotes / total) * 100);
    const filled = Math.round((percent / 100) * steps);

    return "█".repeat(filled) + "░".repeat(steps - filled) + ` ${percent}%`;
}
module.exports = {
    data: new SlashCommandBuilder()
        .setName('rop')
        .setDescription('Request a certain operation you desire!')
        .addStringOption(option =>
            option
                .setName('operation')
                .setDescription('The operation you want to request')
                .setRequired(true)
                .addChoices(
                    { name: 'Partisan Operation', value: '<:Partisan:1455329393282126006> Partisaning' },
                    { name: 'Tank Operation', value: '<:Tank:1455328445629464668> Tanking' },
                    { name: 'Arty Operation', value: '<:150mm:1455329299287773235> Artillery' },
                    { name: 'Airborne Operation', value: '✈️ Airborn' },
                    { name: 'Naval Operation', value: '<:Destroyer:1455328683660415006> Naval' },
                    { name: 'Other Operation', value: '❓ Other' },
                ))
        .addStringOption(option =>
            option
                .setName('other_operation')
                .setDescription('Fill this is if you selected Other Operation and want to specify the operation')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('time_of_the_operation')
                .setDescription('Time of the operation')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('additional_notes')
                .setDescription('Any additional notes for the operation')
                .setRequired(false)),

    async execute(interaction) {
        const choose = interaction.options.getString('operation');
        const custom = interaction.options.getString('other_operation');
        const time = interaction.options.getString('time_of_the_operation');
        const notes = interaction.options.getString('additional_notes');
        


        const upvote = new ButtonBuilder()
            .setCustomId('rop_upvote')
            .setLabel('Upvote')
            .setStyle(ButtonStyle.Success);
        const downvote = new ButtonBuilder()
            .setCustomId('rop_downvote')
            .setLabel('Downvote')
            .setStyle(ButtonStyle.Danger);
        const voteRow = new ActionRowBuilder().addComponents(upvote, downvote);

        let upvotes = 0, downvotes = 0;
        const embed = new EmbedBuilder()
            .setColor('#DBB434')
            .setTitle(`${choose} Operation Request`)
            .addFields(
                { name: '👤 Requested by:', value: `<@${interaction.user.id}>`, inline: true },
                { name: '🕒 Time of Operation:', value: time || 'Not specified', inline: true },
                { name: '📝 Additional Notes:', value: notes || 'None', inline: false },
                { name: "📊 Interested", value: interestBar(upvotes, downvotes), inline: false },

            );
        const embedOther = new EmbedBuilder()
            .setColor('#DBB434')
            .setTitle(`${choose} Operation Request`)
            .addFields(
                { name: '💬 Details:', value: custom || "", inline: false },
                { name: '👤 Requested by:', value: `<@${interaction.user.id}>`, inline: true },
                { name: '🕒 Time of Operation:', value: time || 'Not specified', inline: true },
                { name: '📝 Additional Notes:', value: notes || 'None', inline: false },
                { name: "📊 Interested", value: interestBar(upvotes, downvotes), inline: false },

            );
        const OPERATIONS_REQUEST_CHANNEL_ID = process.env.OPERATIONS_REQUEST_CHANNEL_ID;
        const channel = await interaction.client.channels.fetch(OPERATIONS_REQUEST_CHANNEL_ID);
        if (!channel) {
            return interaction.reply({
                content: 'The operations request channel could not be found. Please contact an administrator.',
                ephemeral: true,
            });
        }
        if (choose === '❓ Other') {
            if (custom) {
                await channel.send({
                    embeds: [embedOther],
                    components: [voteRow]
                });
            } else {
                return interaction.reply({
                    content: 'You selected Other Operation but did not specify the operation. Please provide the operation details.',
                    ephemeral: true,
                });
            }
        } else {
            await channel.send({
                embeds: [embed],
                components: [voteRow]
            });
        }
        await interaction.reply({
            content: 'Your operation request has been submitted successfully!',
            ephemeral: true,
        });
    },
}