const weeklypoll = require('./weeklypoll.js');
const weeklypollChannelId = process.env.WEEKLYPOLL_CHANNEL_ID;
const REACTION_ROLE_CHANNEL_ID = process.env.REACTION_ROLES_CHANNEL_ID;
const reactionRole = require('./reactionroles.js');
const statuses = [
  { name: 'ATR Operations', type: 4 },
  { name: 'Weekly Polls', type: 4 },
  { name: 'ATR Discord', type: 4 },
];
module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`✅ Logged in as ${client.user.tag}`);
    weeklypoll.start(client, weeklypollChannelId);


    reactionRole.send(client, {
      id: 'divisions',
      channelId: REACTION_ROLE_CHANNEL_ID,
      type: 'dropdown',
      title: 'Divisions roles',
      emoji:':crossed_swords:',
      description: 'Select the roles you are interested in in-game!\n\nYou will receive a ping if there is an OP planned for these type of roles or if something is needed for them.',
      roles: [
        { label: 'Tanking', roleId: process.env.ARMOR_ROLE_ID, emoji: process.env.ARMOR__EMOJI },
        { label: 'Artillery', roleId: process.env.ARTY_ROLE_ID, emoji: process.env.ARTY__EMOJI },
        { label: 'Partisan', roleId: process.env.PARTISANS_ROLE_ID, emoji: process.env.PARTISANS__EMOJI },
        { label: 'Naval', roleId: process.env.NAVAL_ROLE_ID, emoji: process.env.NAVAL__EMOJI },
        { label: 'Logistics', roleId: process.env.LOGISTICS_ROLE_ID, emoji: process.env.LOGISTICS__EMOJI },
        { label: 'Facility', roleId: process.env.FACILITY_ROLE_ID, emoji: process.env.FACILITY__EMOJI },
      ]
    });
    reactionRole.send(client, {
      id: 'timezone',
      channelId: REACTION_ROLE_CHANNEL_ID,
      type: 'dropdown',
      emoji: ':alarm_clock:',
      title: 'Timezone roles',
      description: 'Select the timezone you live in!\nThis way we can tag the appropriate timezones for our ops.',
      roles: [
        { label: 'EU', roleId: process.env.EU_ROLE_ID, emoji: process.env.EU_EMOJI },
        { label: 'NA', roleId: process.env.NA_ROLE_ID, emoji: process.env.NA_EMOJI },
        { label: 'ASIA', roleId: process.env.ASIA_ROLE_ID, emoji: process.env.ASIA_EMOJI },
      ]
    });
    reactionRole.send(client, {
      id: 'activethiswar',
      type: 'button',
      channelId: REACTION_ROLE_CHANNEL_ID,
      emoji:'📢',
      title: 'Active This War',
      footer: 'Role will reset after every war, so you will have to re-equip this role every war.',
      description: 'Equip this role if you will be active this war!',
      roles: [
        { label: 'Active this war', roleId: process.env.ACTIVE_ROLE_ID, emoji: process.env.ACTIVE_EMOJI },
      ]
    });

    client.user.setPresence({
      status: 'online', // online | idle | dnd | invisible
      activities: [
        {
          name: 'Audentes Fortuna Iuvat',
          type: 4,
        },
      ],
    });
  },
}

