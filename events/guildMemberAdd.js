const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID;
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    const TICKET_CHANNEL_ID = process.env.TICKET_CHANNEL_ID;
    if (!channel) return;
    const welcomemessageembed = new EmbedBuilder()
      .setTitle(`New recruit!`)
      .setDescription(`${member} Welcome to the **21st Athena Regiment!** 🎉\n
If you're looking to join our ranks, head over to <#${TICKET_CHANNEL_ID}> to go through a quick verification process.
If you are a Colonial from a different regiment, do the same to get yourself an ally role.

If you are a Warden, make sure to desert next war and join the side of freedom and liberty!`)
      .setColor('#DBB434')
      .setFooter({ text: 'Athena Regiment' })
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }));

    const welcomemessage = `${member} joined!\n
Welcome to the **21st Athena regiment!** 🎉
If you're looking to join our ranks, head over to <#${TICKET_CHANNEL_ID}> to go through a quick verification process. If you are a Colonial from a different regiment, do the same to get yourself an ally role.

If you are a Warden, make sure to desert next war and join the side of freedom and liberty!`;
    await channel.send(welcomemessage);
  },
};