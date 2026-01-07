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

        const SERVICE_CHANNEL_ID = process.env.SERVICE_CHANNEL_ID;
        const Facility_service = process.env.FACILITY_UPGRADES === 'true';
        const Lend_lease = process.env.LEND_LEASE === 'true';

        const channel = await client.channels.fetch(SERVICE_CHANNEL_ID);
        if (!channel) return;


        const embed = new EmbedBuilder()
            .setTitle('🛠️ | ATR Services')
            .setDescription(`These are some of our public services we offer as ATR.

# <:${process.env.LOGISTICS__EMOJI}> **Lend Lease**
Lend Lease is a **FREE** service we provide on a small scale. 

${Lend_lease ? `Current maximum of crates: \`${process.env.LendLeaseMax}\`.

Again this is a free service we provide, but please give us some time.

(We are not T-3C 😢)

🟢 This service is currently avaiable!` : '🔴 *This service is currently unavaiable..*'}

████████████████████████████████████████████

# <:${process.env.FACILITY__EMOJI}> **Facility Services**
Request any type of vehicle that is facility locked!

${Facility_service ? `We will deliver all the vehicles to your desired location!
### <:${process.env.BMATS_EMOJI}> Non-RMAT vehicles
If the base vehicle DOES NOT require RMATS we provide this for **FREE!**
### <:${process.env.RMATS_EMOJI}> RMAT vehicles
If the base vehicle DOES require RMATS we will request a small **FEE!**

💰 __PAYMENTS:__
- Components
- RMAT crates


🟢 This service is currently avaiable!` : '🔴 *This service is currently unavaiable..*'}

████████████████████████████████████████████
                `)
            .setColor('#DBB434')

        const row = new ActionRowBuilder();


        row.addComponents(
            new ButtonBuilder()
                .setCustomId('lend_lease_service')
                .setLabel('Lend Lease')
                .setEmoji('🛻')
                .setStyle(Lend_lease ? ButtonStyle.Success : ButtonStyle.Danger)
                .setDisabled(!Lend_lease)
        );
        row.addComponents(
            new ButtonBuilder()
                .setCustomId('facility_service')
                .setLabel('Facility Services')
                .setEmoji('🛠️')
                .setStyle(Facility_service ? ButtonStyle.Success : ButtonStyle.Danger)
                .setDisabled(!Facility_service)
        );

        await channel.bulkDelete(10).catch(() => { });


        await channel.send({
            embeds: [embed],
            components: [row],
        });
    },
};