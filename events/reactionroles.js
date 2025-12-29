const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { loadRoles, saveRoles } = require('../functions/roleStorage');


module.exports = {
    send: async (client, config, force = false) => {

        const stored = loadRoles();

        // ⛔ Al bestaand bericht → niets doen
        if (stored.messages[config.id] && !force) {
            console.log(`Reaction role "${config.id}" already exists.`);
            return;
        }

        const channel = await client.channels.fetch(config.channelId);
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setTitle(`${config.title} ${config.emoji}`)
            .setDescription(config.description)
            .setColor('#DBB434');
        if (config.footer) {
            embed.setFooter({ text: config.footer });
        }
        let rows = []; // array van ActionRows

        if (config.type === 'dropdown') {
            const select = new StringSelectMenuBuilder()
                .setCustomId(`rr_${config.id}`)
                .setPlaceholder(`Choose your roles`)
                .setMinValues(0)
                .setMaxValues(config.roles.length)
                .addOptions(
                    config.roles.map(r => ({
                        label: r.label,
                        value: r.roleId,
                        emoji: r.emoji
                    }))
                );

            const row = new ActionRowBuilder().addComponents(select);
            rows.push(row);

        } else if (config.type === 'button') {
            // Maak buttons (max 5 per ActionRow)
            const buttons = config.roles.map(r =>
                new ButtonBuilder()
                    .setCustomId(`rr_${config.id}_${r.roleId}`)
                    .setLabel(r.label)
                    .setEmoji(r.emoji)
                    .setStyle(ButtonStyle.Primary)
            );

            // verdeel in ActionRows van max 5 buttons
            for (let i = 0; i < buttons.length; i += 5) {
                const row = new ActionRowBuilder().addComponents(...buttons.slice(i, i + 5));
                rows.push(row);
            }
        }

        const message = await channel.send({ embeds: [embed], components: rows });
        const storedRoles = loadRoles();
        storedRoles.messages[config.id] = { channelId: config.channelId, messageId: message.id, type: config.type, roles: config.roles.map(r => r.roleId), users: {} };
        saveRoles(storedRoles);

        console.log(`✅ Reaction role message "${config.id}" sent.`);
    },
};