const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`✅ ${client.user.tag} is online`);

    const TICKET_CHANNEL_ID = process.env.TICKET_CHANNEL_ID;

    const channel = await client.channels.fetch(TICKET_CHANNEL_ID);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle('🎫 | Start Verification')
      .setDescription(
        'Interested in joining us? Click on the button below.\n' +
        'Our support team will help you as soon as possible.'
      )
      .setColor('#DBB434')
      .setFooter({ text: 'ATR Support' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('create_ticket')
        .setLabel('Start verification')
        .setEmoji('🎫')
        .setStyle(ButtonStyle.Primary)
    );

    // Optioneel: kanaal leegmaken
    await channel.bulkDelete(10).catch(() => {});

    await channel.send({
      embeds: [embed],
      components: [row],
    });
  },
};