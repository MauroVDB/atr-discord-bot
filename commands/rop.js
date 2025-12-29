const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

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
                    { name: 'Partisan Operation', value: 'Partisaning' },
                    { name: 'Tank Operation', value: 'Tanking' },
                    { name: 'Arty Operation', value: 'Artillery' },
                    { name: 'Airborne Operation', value: 'Airborn' },
                    { name: 'Naval Operation', value: 'Naval' },
                    { name: 'Other Operation', value: 'Other' },
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

        const embed = new EmbedBuilder()
            .setColor('#DBB434')
            .addFields(
                { name: `Operation request:`, value: choose, inline: false },
                { name: 'Requested by:', value: `<@${interaction.user.id}>`, inline: false },
                { name: 'Time of Operation:', value: time || 'Not specified', inline: false },
                { name: 'Additional Notes:', value: notes || 'None', inline: false },
                // { name: 'Upvotes', value: '0', inline: true },
                // { name: 'Downvotes', value: '0', inline: true },
            );
        const embedOther = new EmbedBuilder()
            .setColor('#DBB434')
            .addFields(
                { name: `Operation request:`, value: choose, inline: false },
                { name: 'Requested by:', value: `<@${interaction.user.id}>`, inline: false },
                { name: 'Details:', value: custom || "", inline: false },
                { name: 'Time of Operation:', value: time || 'Not specified', inline: false },
                { name: 'Additional Notes:', value: notes || 'None', inline: false },
                // { name: 'Upvotes', value: '0', inline: true },
                // { name: 'Downvotes', value: '0', inline: true },
            );
        const OPERATIONS_REQUEST_CHANNEL_ID = process.env.OPERATIONS_REQUEST_CHANNEL_ID;
        const channel = await interaction.client.channels.fetch(OPERATIONS_REQUEST_CHANNEL_ID);
        if (!channel) {
            return interaction.reply({
                content: 'The operations request channel could not be found. Please contact an administrator.',
                ephemeral: true,
            });
        }
        if (choose === 'Other') {
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