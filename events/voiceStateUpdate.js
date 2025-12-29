const { ChannelType } = require('discord.js');

const JOIN_TO_CREATE_CHANNELS = {
    FRONTLINE: process.env.FRONTLINE_VOICE,
    LOGISTICS: process.env.LOGISTICS_VOICE,
};

function getNextNumber(guild, categoryId, prefix) {
    const channels = guild.channels.cache.filter(c =>
        c.parentId === categoryId &&
        c.type === 2 && // GuildVoice
        c.name.startsWith(prefix)
    );

    return channels.size + 1;
}

const VOICE_CATEGORY_ID = process.env.VOICE_CATEGORY_ID;
module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        // User joint geen kanaal
        if (!newState.channelId) return;

        const joinChannels = Object.values(JOIN_TO_CREATE_CHANNELS);

        // Is dit één van de "join to create" kanalen?
        if (!joinChannels.includes(newState.channelId)) return;

        const guild = newState.guild;
        const member = newState.member;

        // Naam bepalen op basis van kanaal
        let prefix = 'Voice';
        if (newState.channelId === JOIN_TO_CREATE_CHANNELS.FRONTLINE)
            prefix = '⚔️ Frontline';
        if (newState.channelId === JOIN_TO_CREATE_CHANNELS.LOGISTICS)
            prefix = '🚛 Logistics';
        const number = getNextNumber(guild, VOICE_CATEGORY_ID, prefix);
        const channelName = `${prefix} ${number}`;

        // Nieuw voice kanaal maken
        const newChannel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildVoice,
            parent: VOICE_CATEGORY_ID,
            permissionOverwrites: [
                {
                    id: member.id,
                    allow: ['ManageChannels', 'MoveMembers'],
                },
            ],
        });

        // User verplaatsen
        await member.voice.setChannel(newChannel);

        // ⏱️ Auto delete wanneer leeg
        const interval = setInterval(async () => {
            if (newChannel.members.size === 0) {
                clearInterval(interval);
                await newChannel.delete().catch(() => { });
            }
        }, 3000);
    },
};