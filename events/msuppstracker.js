// const { EmbedBuilder } = require("discord.js");
// const db = require("../functions/msupps");

// const calculateStock = require("./msuppscurrentstock");

// let messageId = null;

// module.exports = async function updateMaintenanceEmbed(client) {
//   const channel = await client.channels.fetch(
//     process.env.MAINTENANCE_CHANNEL_ID
//   );

//   const tunnels = db.prepare(`
//     SELECT * FROM maintenance_tunnels
//   `).all();

//   const embed = new EmbedBuilder()
//     .setTitle("🛠️ Maintenance Tunnels")
//     .setColor(0xffa500)
//     .setTimestamp();

//   let totalBurn = 0;

//   for (const t of tunnels) {
//     const { remaining } = calculateStock(t);

//     totalBurn += t.burn_rate_per_hour;

//     const hoursLeft = t.burn_rate_per_hour > 0
//       ? (remaining / t.burn_rate_per_hour).toFixed(1)
//       : "∞";

//     embed.addFields({
//       name: `#${t.id} – ${t.location}`,
//       value:
//         `🔥 ${t.burn_rate_per_hour}/h\n` +
//         `📦 Stock: ${Math.floor(remaining)} msupps\n` +
//         `⏳ ${hoursLeft} hours remaining`
//     });
//   }

//   embed.setFooter({
//     text: `Total burn-rate: ${totalBurn}/h (${totalBurn * 24}/day)`
//   });

//   if (messageId) {
//     const msg = await channel.messages.fetch(messageId);
//     await msg.edit({ embeds: [embed] });
//   } else {
//     const msg = await channel.send({ embeds: [embed] });
//     messageId = msg.id;
//   }
// };