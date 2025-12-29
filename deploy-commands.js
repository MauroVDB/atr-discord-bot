const { REST, Routes } = require('discord.js');
require('dotenv').config();
const fs = require('fs');


const commands = [];
const commandFiles = fs
  .readdirSync('./commands')
  .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Slash commands registreren...');

    await rest.put(
  Routes.applicationGuildCommands(
    process.env.CLIENT_ID,
    '835197326900854844'
  ),
  { body: commands }
);

    console.log('Slash commands geregistreerd!');
  } catch (error) {
    console.error(error);
  }
})();