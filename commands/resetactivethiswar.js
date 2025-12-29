const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const reactionRole = require('../events/reactionroles');
const { loadRoles, saveRoles } = require('../functions/roleStorage');
const staffRole = process.env.STAFF_ROLE_ID

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resetactivethiswar')
        .setDescription('Resets the Active This War button reaction role for all users.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const configId = 'activethiswar';
        const data = loadRoles();
        const entry = data.messages[configId];

        if (!entry) return interaction.reply({ content: '❌ Reaction role config not found.', ephemeral: true });
        if (entry.type !== 'button') return interaction.reply({ content: '❌ This command only works for button reaction roles.', ephemeral: true });
        if (!interaction.member.roles.cache.has(staffRole)) return interaction.reply({ content: 'No permission.' });


        const roleId = entry.roles[0];

        // Verwijder rol bij iedereen
        for (const userId of Object.keys(entry.users)) {
            const member = await interaction.guild.members.fetch(userId).catch(() => null);
            if (member?.roles.cache.has(roleId)) await member.roles.remove(roleId).catch(() => null);
        }

        // Reset users enkel voor dit bericht


        // Verwijder oud bericht
        const channel = await interaction.guild.channels.fetch(entry.channelId).catch(() => null);
        if (!channel) return interaction.reply({ content: '❌ Channel not found.', ephemeral: true });

        if (entry.messageId) {
            const oldMessage = await channel.messages.fetch(entry.messageId).catch(() => null);
            if (oldMessage) await oldMessage.delete().catch(() => null);
        }
        entry.users = {};
        saveRoles(data);

        // Verstuur opnieuw via reactionroles.js
        await reactionRole.send(interaction.client, {
            id: configId,
            type: entry.type,
            channelId: entry.channelId,
            title: 'Active This War',
            roles: [{ label: 'Active this war', roleId: roleId, emoji: '🛡️' }]
        }, true);

        return interaction.reply({ content: '✅ Active This War role has been reset and the button message resent.', ephemeral: true });
    }
};