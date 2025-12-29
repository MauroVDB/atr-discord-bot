const {
  ChannelType,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextInputStyle,
  ModalBuilder,
  TextInputBuilder,
  AttachmentBuilder,
} = require('discord.js');
const { voteTrackerPoll, options } = require('./weeklypoll');
const { loadRopVotes, saveRopVotes } = require('../functions/ropStorage');
const { savePollData } = require('../functions/pollStorage');
const { loadRoles, saveRoles } = require('../functions/roleStorage');

const ticketMessages = new Map();
const closedMessages = new Map();
const voteTracker = new Map();
const storedVotes = loadRopVotes();

for (const messageId in storedVotes) {
  voteTracker.set(
    messageId,
    new Map(Object.entries(storedVotes[messageId]))
  );
}
const verifiedMessages = new Map();
const allyMessages = new Map();

function getField(embed, name) {
  return embed.data.fields?.find(f => f.name === name);
}

function makeBar(percentage, size = 20) {
  const filled = Math.round((percentage / 100) * size);
  const empty = size - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}
function persistRopVotes(voteTracker) {
  const data = {};

  for (const [messageId, votes] of voteTracker.entries()) {
    data[messageId] = Object.fromEntries(votes);
  }

  saveRopVotes(data);
}
module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    const ATR_ROLE = process.env.ATR_ROLE;
    const PRIVATE_ROLE = process.env.PRIVATE_ROLE;
    const STAFF_ROLE_ID = process.env.STAFF_ROLE_ID;
    const ALLY_ROLE_ID = process.env.ALLY_ROLE_ID;


    /* =========================
      REACTION ROLES
    ========================== */

    // Controel of het een knop/dropdownmenu is en of het custom id van de interactie start met "rr".
    if ((interaction.isButton() || interaction.isStringSelectMenu()) && interaction.customId?.startsWith('rr_')) {

      const configId = interaction.customId.split('_')[1];
      const data = loadRoles();
      const entry = data.messages[configId];
      if (!entry) return;

      // Alleen reageren op ons bericht
      if (interaction.message.id !== entry.messageId) return;

      
      const member = await interaction.guild.members.fetch(interaction.user.id);
      
      //Code voor de dropdowns
      if (entry.type === 'dropdown' && interaction.isStringSelectMenu()) {
        const selectedRoles = interaction.values; // array van roleIds

        // ➖ Rollen verwijderen die niet meer geselecteerd zijn
        for (const roleId of entry.roles) {
          if (!selectedRoles.includes(roleId) && member.roles.cache.has(roleId)) {
            await member.roles.remove(roleId);
          }
        }

        // ➕ Rollen toevoegen die geselecteerd zijn
        for (const roleId of selectedRoles) {
          if (!member.roles.cache.has(roleId)) {
            await member.roles.add(roleId);
          }
        }

        // 🧠 Opslaan
        entry.users[interaction.user.id] = selectedRoles;
        saveRoles(data);

        await interaction.reply({
          content: '✅ Your roles have been updated.',
          ephemeral: true
        });
      } else if (entry.type === 'button' && interaction.isButton()) {
        const roleId = interaction.customId.split('_')[2];
        if (!roleId) return;

        if (member.roles.cache.has(roleId)) await member.roles.remove(roleId);
        else await member.roles.add(roleId);

        // Update user data
        const current = entry.users[interaction.user.id] || [];
        if (current.includes(roleId)) current.splice(current.indexOf(roleId), 1);
        else current.push(roleId);
        entry.users[interaction.user.id] = current;

        saveRoles(data);
        await interaction.reply({ content: 'Active this war updated', ephemeral: true});
        return;
      }
    }
    /* =========================
      WEEKLY POLL VOTING
    ========================== */

    if (interaction.isButton() && interaction.customId.startsWith('weekly_vote_')) {


      const message = interaction.message;
      const messageVotes = voteTrackerPoll.get(message.id);
      if (!messageVotes) return;

      const userId = interaction.user.id;
      const chosenIndex = parseInt(interaction.customId.replace('weekly_vote_', ''));

      // Stem opslaan
      messageVotes.set(userId, chosenIndex);
      savePollData(
        Object.fromEntries(
          [...voteTrackerPoll.entries()].map(([msgId, votes]) => [
            msgId,
            Object.fromEntries(votes)
          ])
        )
      );

      // Stemmen tellen
      const counts = {};
      options.forEach((_, i) => counts[i] = 0);
      for (const vote of messageVotes.values()) counts[vote]++;

      // Totaal stemmen
      const totalVotes = Object.values(counts).reduce((a, b) => a + b, 0);

      // Winnaar bepalen
      let maxVotes = 0;
      let winnerIndex = null;
      for (const [i, count] of Object.entries(counts)) {
        if (count > maxVotes) {
          maxVotes = count;
          winnerIndex = i;
        }
      }

      // Grafische description
      let description = 'Vote for the operation you wish to see next!\n\n';

      options.forEach((opt, i) => {
        const count = counts[i];
        const percent = totalVotes === 0 ? 0 : (count / totalVotes) * 100;
        const bar = makeBar(percent);

        description += `**${opt.label}**\n`;
        description += `\`${bar}\` **${percent.toFixed(1)}%** (${count})\n\n`;
      });

      description += `🏆 **Current winner:** ${winnerIndex !== null ? options[winnerIndex].label : '—'
        } (${maxVotes} votes)`;

      // Buttons updaten
      const newRow = new ActionRowBuilder();
      options.forEach((opt, i) => {
        newRow.addComponents(
          new ButtonBuilder()
            .setCustomId(`weekly_vote_${i}`)
            .setLabel(`${opt.label}`)
            .setStyle(ButtonStyle.Primary)
            .setEmoji(opt.emoji)
        );
      });

      // Embed updaten
      const embed = EmbedBuilder.from(message.embeds[0])
        .setTitle('🗳️ Weekly Operations Demands')
        .setDescription(description)
        .setColor('#DBB434');

      await interaction.update({ components: [newRow], embeds: [embed] });
      return;
    }
    /* =========================
       SLASH COMMANDS
    ========================== */
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        const replyOptions = { content: '❌ Something went wrong!', ephemeral: true };
        if (interaction.replied || interaction.deferred) await interaction.followUp(replyOptions);
        else await interaction.reply(replyOptions);
      }
    }
    /* =========================
       BUTTON INTERACTIONS
    ========================== */
    const isStaff = interaction.member.roles.cache.has(STAFF_ROLE_ID);

    if (interaction.isButton()) {
      const message = interaction.message;
      const userId = interaction.user.id;

      // ===================== ROP UP/DOWNVOTE ===================== //
      if (interaction.customId === 'rop_upvote' || interaction.customId === 'rop_downvote') {
        await interaction.deferUpdate();

        if (!voteTracker.has(message.id)) voteTracker.set(message.id, new Map());
        const userVotes = voteTracker.get(message.id);

        const previousVote = userVotes.get(userId);
        const newVote = interaction.customId === 'rop_upvote' ? 'upvote' : 'downvote';
        if (previousVote === newVote) return;

        userVotes.set(userId, newVote);
        persistRopVotes(voteTracker);

        // Count votes
        let upvotes = 0, downvotes = 0;
        for (const vote of userVotes.values()) {
          if (vote === 'upvote') upvotes++;
          if (vote === 'downvote') downvotes++;
        }

        const upvoteButton = new ButtonBuilder()
          .setCustomId('rop_upvote')
          .setStyle(ButtonStyle.Success)
          .setEmoji('👍')
          .setLabel(`Upvotes: ${upvotes}`);

        const downvoteButton = new ButtonBuilder()
          .setCustomId('rop_downvote')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('👎')
          .setLabel(`Downvotes: ${downvotes}`);

        const row = new ActionRowBuilder().addComponents(upvoteButton, downvoteButton);
        await message.edit({ components: [row] });
        return;
      }

      /* ===================== TICKETS ===================== */

      // -------- Create Ticket -------- //
      if (interaction.customId === 'create_ticket') {
        const guild = interaction.guild;
        const user = interaction.user;

        await interaction.deferReply({ ephemeral: true });

        // Check existing ticket
        const existing = guild.channels.cache.find(c => c.topic === user.id);
        if (existing) return interaction.editReply({ ephemeral: true, content: `❌ You already have a ticket: ${existing}` });

        // Create ticket channel

        const ticketCategoryId = process.env.TICKET_CATEGORY_ID;
        const channel = await guild.channels.create({
          name: `ticket-${user.username}`,
          type: ChannelType.GuildText,
          topic: user.id,
          parent: ticketCategoryId,
          permissionOverwrites: [
            { id: guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            { id: STAFF_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
          ],
        });

        // Ticket embed and buttons

        const verifyBtn = new ButtonBuilder().setCustomId('verify_ticket').setLabel('| Verify player').setEmoji('✅').setStyle(ButtonStyle.Success);
        const denyBtn = new ButtonBuilder().setCustomId('deny_ticket').setLabel('| Deny player').setEmoji('❌').setStyle(ButtonStyle.Danger);
        const closeBtn = new ButtonBuilder().setCustomId('close_ticket').setLabel('| Close ticket').setEmoji('🔒').setStyle(ButtonStyle.Primary);
        const allyBtn = new ButtonBuilder().setCustomId('ally_ticket').setLabel('| Ally player').setEmoji('🤝').setStyle(ButtonStyle.Secondary);
        const row = new ActionRowBuilder().addComponents(verifyBtn, denyBtn, allyBtn, closeBtn);

        const path = require('path');
        const embed = new EmbedBuilder()
          .setTitle('🎫 | Verification started')
          .setDescription(`Welcome ${user}!\nPlease choose a method to verify yourself to join ATR or to become an ally.`)
          .addFields(
            { name: 'Options:', value: '\u200B' },
            { name: '🎮 In-game Verification', value: 'Provide a screenshot of your `F1 menu` or the current `intel map`.' },
            { name: '<:Logo:1454890750390042778> SIGIL Verification', value: 'Using the `/sigilauth status (user)` command.' }
          )
          .setFooter({ text: 'ATR Support' })
          .setColor('#DBB434')
          .setImage('attachment://image.png');

        // Send ticket message
        await interaction.editReply({ content: '🎫 Creating your ticket...', ephemeral: true });

        const image1 = new AttachmentBuilder(path.join(__dirname, '../images/image.png'));
        const ticketMessage = await channel.send({ content: `<@&${STAFF_ROLE_ID}> ${user}`, embeds: [embed], components: [row], files: [image1] });
        ticketMessages.set(channel.id, ticketMessage);

        return interaction.editReply({ content: `✅ Ticket created: ${channel}`, ephemeral: true });
      }
      // -------- Ally -------- //
      if (interaction.customId === 'ally_ticket' && isStaff) {
        const userId = interaction.channel.topic;
        const user = await interaction.guild.members.fetch(userId).catch(() => null);
        const VerifiedCategory = process.env.VERIFIED_CATEGORY_ID;

        if (!user) return interaction.reply({ content: '❌ Player not found.', ephemeral: true });

        if (user.roles.cache.has(ALLY_ROLE_ID)) {
          return interaction.reply({ content: '❌ Player is already an ally.', ephemeral: true });
        }
        await user.roles.add(ALLY_ROLE_ID).catch(() => { });
        user.send('You have been **successfully added** as an ally to the ATR Regiment!').catch(() => { });
        const closeBtn = new ButtonBuilder().setCustomId('close_ticket').setLabel('| Close ticket').setEmoji('🔒').setStyle(ButtonStyle.Primary);
        const deleteBtn = new ButtonBuilder().setCustomId('delete_ticket').setLabel('| Delete ticket').setEmoji('🗑️').setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder().addComponents(closeBtn, deleteBtn);
        interaction.channel.setName(`verified-${interaction.channel.name.split('-')[1]}`).catch(() => console.warn('Rate limit rename.'));
        const allyMessage = await interaction.reply({ content: `${user} has been added as an ally!`, components: [row], ephemeral: false });
        allyMessages.set(interaction.channel.id, allyMessage);
        if (VerifiedCategory) {
          await interaction.channel.setParent(VerifiedCategory).catch(() => console.warn('Rate limit category set.'));
        }
        return;
      } else {
        if (!isStaff) {
          return interaction.reply({ content: '❌ You do not have permission to perform this action.', ephemeral: true });
        }
      }
      // -------- Verify / Deny -------- //
      if ((interaction.customId === 'verify_ticket' || interaction.customId === 'deny_ticket') && isStaff) {

        const userId = interaction.channel.topic;
        const user = await interaction.guild.members.fetch(userId).catch(() => null);
        const VerifiedCategory = process.env.VERIFIED_CATEGORY_ID;

        if (!user) return interaction.reply({ content: '❌ Player not found.', ephemeral: true });
        else if (user.roles.cache.has(ATR_ROLE)) {
          return interaction.reply({ content: '❌ Player is already verified.', ephemeral: true });
        }

        if (interaction.customId === 'verify_ticket') {
          await user.roles.add(ATR_ROLE).catch(() => { });
          await user.roles.add(PRIVATE_ROLE).catch(() => { });
          user.send('You have been **successfully verified** into the ATR Regiment! Welcome o7.').catch(() => { });
          const closeBtn = new ButtonBuilder().setCustomId('close_ticket').setLabel('| Close ticket').setEmoji('🔒').setStyle(ButtonStyle.Primary);
          const deleteBtn = new ButtonBuilder().setCustomId('delete_ticket').setLabel('| Delete ticket').setEmoji('🗑️').setStyle(ButtonStyle.Danger);
          const row = new ActionRowBuilder().addComponents(closeBtn, deleteBtn);
          interaction.channel.setName(`verified-${interaction.channel.name.split('-')[1]}`).catch(() => console.warn('Rate limit rename.'));
          const verifiedMessage = await interaction.reply({ content: `${user} has been verified!`, components: [row], ephemeral: false });
          verifiedMessages.set(interaction.channel.id, verifiedMessage);
          if (VerifiedCategory) {
            await interaction.channel.setParent(VerifiedCategory).catch(() => console.warn('Rate limit category set.'));
          }
          return;
        } else if (interaction.customId === 'deny_ticket') {
          const redenInput = new TextInputBuilder().setCustomId('reden_input').setLabel("Reason for denial (optional)").setStyle(TextInputStyle.Short).setRequired(false);
          const modal = new ModalBuilder().setCustomId('deny_modal').setTitle('Deny Verification').addComponents(new ActionRowBuilder().addComponents(redenInput));
          await interaction.showModal(modal);
        }
        return;
      } else {
        if (!isStaff) {
          return interaction.reply({ content: '❌ You do not have permission to perform this action.', ephemeral: true });
        }
      }
    }
    // -------- Close Ticket -------- //
    if (interaction.customId === 'close_ticket' && isStaff) {
      const userId = interaction.channel.topic;
      const ClosedCategory = process.env.CLOSED_CATEGORY_ID;
      await interaction.deferUpdate();
      await interaction.channel.permissionOverwrites.delete(userId);
      if(!isStaff) return interaction.followUp({ content: '❌ You do not have permission to perform this action.', ephemeral: true });
      
      const reopenBtn = new ButtonBuilder().setCustomId('reopen_ticket').setLabel('| Reopen ticket').setEmoji('🔁').setStyle(ButtonStyle.Success);
      const deleteBtn = new ButtonBuilder().setCustomId('delete_ticket').setLabel('| Delete ticket').setEmoji('🗑️').setStyle(ButtonStyle.Danger);
      const tempRow = new ActionRowBuilder().addComponents(reopenBtn, deleteBtn);

      const verifiedMessage = verifiedMessages.get(interaction.channel.id);
      if (verifiedMessage) {
        await verifiedMessage.edit({ components: [] });
        verifiedMessages.delete(interaction.channel.id);
      }
      const allyMessage = allyMessages.get(interaction.channel.id);
      if (allyMessage) {
        await allyMessage.edit({ components: [] });
        allyMessages.delete(interaction.channel.id);
      }

      const embed = new EmbedBuilder().setTitle('🔒 | Ticket Closed').setDescription(`Ticket closed by ${interaction.user}.`);
      const closeMessage = await interaction.channel.send({ embeds: [embed], components: [tempRow] });
      closedMessages.set(interaction.channel.id, closeMessage);

      interaction.channel.setName(`closed-${interaction.channel.name.split('-')[1]}`).catch(() => console.warn('Rate limit rename.'));
      if (ClosedCategory) {
        await interaction.channel.setParent(ClosedCategory).catch(() => console.warn('Rate limit category set.'));
      }
      return;
    }

    // -------- Reopen Ticket -------- //
    if (interaction.customId === 'reopen_ticket' && isStaff) {
      await interaction.deferUpdate();
      const userId = interaction.channel.topic;

      await interaction.channel.permissionOverwrites.edit(userId, { ViewChannel: true, SendMessages: true });

      const closeMessage = closedMessages.get(interaction.channel.id);
      if (closeMessage) {
        await closeMessage.edit({ components: [] });
        closedMessages.delete(interaction.channel.id);
      }

      const originalMessage = ticketMessages.get(interaction.channel.id);
      if (originalMessage) {
        const closeBtn = new ButtonBuilder().setCustomId('close_ticket').setLabel('| Close ticket').setEmoji('🔒').setStyle(ButtonStyle.Primary);
        const verifyBtn = new ButtonBuilder().setCustomId('verify_ticket').setLabel('| Verify player').setEmoji('✅').setStyle(ButtonStyle.Success);
        const denyBtn = new ButtonBuilder().setCustomId('deny_ticket').setLabel('| Deny player').setEmoji('❌').setStyle(ButtonStyle.Danger);
        const allyBtn = new ButtonBuilder().setCustomId('ally_ticket').setLabel('| Ally player').setEmoji('🤝').setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(verifyBtn, denyBtn, allyBtn, closeBtn);
        await originalMessage.edit({ components: [row] });
      }

      await interaction.channel.send({ embeds: [new EmbedBuilder().setTitle('🔓 | Ticket Reopened').setDescription(`Ticket reopened by ${interaction.user}.`).setColor('#DBB434')] });
      interaction.channel.setName(`ticket-${interaction.channel.name.split('-')[1]}`).catch(() => console.warn('Rate limit rename.'));
      return;
    }

    // -------- Delete Ticket -------- //
    if (interaction.customId === 'delete_ticket' && isStaff) {
      try {
        await interaction.deferUpdate();
        await interaction.channel.send('🗑️ This ticket will be deleted in 5 seconds...');
        setTimeout(() => interaction.channel.delete(), 5000);
      } catch (error) {
        console.error(error);
        return interaction.followUp({ content: '❌ Something went wrong while deleting the ticket.', ephemeral: true });
      }
      return;
    }


    /* =========================
       MODAL SUBMITS
    ========================== */
    if (interaction.isModalSubmit() && interaction.customId === 'deny_modal') {
      const reason = interaction.fields.getTextInputValue('reden_input');
      const userId = interaction.channel.topic;
      const user = await interaction.guild.members.fetch(userId).catch(() => null);
      if (!user || user.roles.cache.has(ATR_ROLE)) return interaction.reply({ content: '❌ Player is either already verified or not found.', ephemeral: true });

      const embed = new EmbedBuilder().setTitle('❌ Verification Denied').setDescription(`Your verification has been denied for the following reason:\n${reason || 'No reason provided.'}`).setColor('#DBB434');
      await user.send({ content: `Your verification has been denied for reason: **${reason || 'No reason provided'}**.\nContact us in ${interaction.channel}` }).catch(() => { });
      await interaction.reply({ content: `❌ ${user} has been denied verification: ${reason || 'No reason provided'}`, ephemeral: false });
    }
  }
};