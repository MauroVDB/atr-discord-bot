const { PermissionsBitField } = require("discord.js");

const LINK_REGEX =
    /(https?:\/\/|discord\.gg|discord\.com\/invite)/i;

module.exports = {
    name: "messageCreate",
    once: false,

    async execute(message) {
        if (message.author.bot) return;
        if (!message.guild) return;

        const hasAllowedRole = message.member.roles.cache.has(process.env.ATR_ROLE);

        if(hasAllowedRole) return;

        if (hasAllowedRole) return;

        // Alleen @everyone (geen rollen)
        if (message.member.roles.cache.size !== 1) return;

        // Geen link → niks doen
        if (!LINK_REGEX.test(message.content)) return;

        // Bericht verwijderen
        await message.delete().catch(() => { });

        // Waarschuwing sturen (en automatisch verwijderen)
        const warn = await message.channel.send(
            `❌ ${message.author}, you are not allowed to send Discord invite links.`
        );

        setTimeout(() => warn.delete().catch(() => { }), 5000);
    }
};