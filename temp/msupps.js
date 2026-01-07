// const {
//     SlashCommandBuilder,
//     EmbedBuilder
// } = require("discord.js");

// const db = require("../functions/msupps");
// const updateEmbed = require("../events/msuppstracker");
// const calculateStock = require("../events/msuppscurrentstock");

// module.exports = {
//     data: new SlashCommandBuilder()
//         .setName("maintenance")
//         .setDescription("Manage maintenance tunnels")

//         .addSubcommand(sub =>
//             sub
//                 .setName("add")
//                 .setDescription("Add a maintenance tunnel")
//                 .addStringOption(opt =>
//                     opt.setName("location")
//                         .setDescription("Location")
//                         .setRequired(true)
//                 )
//                 .addNumberOption(opt =>
//                     opt.setName("burnrate")
//                         .setDescription("Msupps per hour")
//                         .setRequired(true)
//                 )
//         )
//         .addSubcommand(sub =>
//             sub
//                 .setName("deliver")
//                 .setDescription("Deliver maintenance supplies to a tunnel")
//                 .addIntegerOption(opt =>
//                     opt.setName("id")
//                         .setDescription("Tunnel ID")
//                         .setRequired(true)
//                 )
//                 .addIntegerOption(opt =>
//                     opt.setName("amount")
//                         .setDescription("Msupps delivered")
//                         .setRequired(true)
//                 )
//         )
//         .addSubcommand(sub =>
//             sub.setName("list")
//                 .setDescription("List all maintenance tunnels")
//         )

//         .addSubcommand(sub =>
//             sub
//                 .setName("remove")
//                 .setDescription("Remove a maintenance tunnel")
//                 .addIntegerOption(opt =>
//                     opt.setName("id")
//                         .setDescription("Tunnel ID")
//                         .setRequired(true)
//                 )
//         ),

//     async execute(interaction) {
//         const sub = interaction.options.getSubcommand();

//         // 🚚 DELIVER
//         if (sub === "deliver") {
//             const id = interaction.options.getInteger("id");
//             const amount = interaction.options.getInteger("amount");

//             const tunnel = db.prepare(`
//     SELECT * FROM maintenance_tunnels WHERE id = ?
//   `).get(id);

//             if (!tunnel) {
//                 return interaction.reply({ content: "❌ Invalid tunnel ID", ephemeral: true });
//             }

//             const { remaining } = calculateStock(tunnel);
//             const newStock = remaining + amount;

//             db.prepare(`
//     UPDATE maintenance_tunnels
//     SET current_stock = ?, last_updated_at = CURRENT_TIMESTAMP
//     WHERE id = ?
//   `).run(newStock, id);

//             await updateEmbed(interaction.client);

//             return interaction.reply(
//                 `🚚 **Delivery registered**\n` +
//                 `📍 ${tunnel.location}\n` +
//                 `📦 +${amount} msupps\n` +
//                 `📊 New stock: ${Math.floor(newStock)}`
//             );
//         }
//         // ➕ ADD
//         if (sub === "add") {
//             const location = interaction.options.getString("location");
//             const burnRate = interaction.options.getNumber("burnrate");

//             db.prepare(`
//         INSERT INTO maintenance_tunnels
//         (location, burn_rate_per_hour, added_by)
//         VALUES (?, ?, ?)
//       `).run(location, burnRate, interaction.user.id);

//             return interaction.reply(
//                 `🛠️ **Maintenance tunnel added**\n` +
//                 `📍 ${location}\n` +
//                 `🔥 ${burnRate} msupps/hour`
//             );
//         }

//         // 📋 LIST
//         if (sub === "list") {
//             const tunnels = db.prepare(`
//         SELECT * FROM maintenance_tunnels
//         ORDER BY burn_rate_per_hour DESC
//       `).all();

//             if (!tunnels.length) {
//                 return interaction.reply("No maintenance tunnels registered.");
//             }

//             let totalPerHour = 0;

//             const embed = new EmbedBuilder()
//                 .setTitle("🛠️ Maintenance Tunnels")
//                 .setColor(0xffa500);

//             for (const t of tunnels) {
//                 totalPerHour += t.burn_rate_per_hour;

//                 embed.addFields({
//                     name: `#${t.id} – ${t.location}`,
//                     value:
//                         `🔥 ${t.burn_rate_per_hour}/h\n` +
//                         `🧮 ${t.burn_rate_per_hour * 24}/day`
//                 });
//             }

//             embed.setFooter({
//                 text: `Total: ${totalPerHour}/h (${totalPerHour * 24}/day)`
//             });

//             return interaction.reply({ embeds: [embed] });
//         }

//         // ❌ REMOVE
//         if (sub === "remove") {
//             const id = interaction.options.getInteger("id");

//             const result = db.prepare(`
//         DELETE FROM maintenance_tunnels WHERE id = ?
//       `).run(id);

//             if (result.changes === 0) {
//                 return interaction.reply({
//                     content: "❌ Invalid ID",
//                     ephemeral: true
//                 });
//             }

//             return interaction.reply(
//                 `🗑️ Maintenance tunnel #${id} removed.`
//             );
//         }
//     }
// };