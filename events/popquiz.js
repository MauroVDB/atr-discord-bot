const cron = require('node-cron');

const { addScore, getLeaderboard } = require('../functions/popquiz'); // split data/logica

const { EmbedBuilder } = require('discord.js');

const popQuestions = [
    { vraag: 'What is the max range of a watchtower?', antwoord: ['80 meters', '80', '80 meter'] },
    { vraag: 'What resource is needed for rmats?', antwoord: ['components', 'comps'] },
    { vraag: 'How is the Warden capital city called?', antwoord: 'whedons row' },
    { vraag: 'What vehicle is used to transport shipping containers?', antwoord: 'flatbed' },
    { vraag: 'What item is required to respawn at a base?', antwoord: ['shirts', 'soldier supplies'] },
    { vraag: 'What is the cost of a R1-hauler?', antwoord: ['100 bmats', '100 basic materials'] },
    { vraag: 'What does BOB stand for?', antwoord: 'border base' },
    { vraag: 'What is the max range for a colonial 120mm gun?', antwoord: ['250 meters', '250', '250 meter'] },
    { vraag: 'What is the most rare material?', antwoord: ['Rare Metal', 'Rares'] },
    { vraag: 'What is the highest rank you can get?', antwoord: ['Field Marshall', 'FM'] },
    { vraag: 'What material is used to lay train tracks?', antwoord: ['pcons', 'processed construction materials', 'pcmats'] },
    { vraag: 'How much does 1 shirt cost? (NOT A CRATE)', antwoord: ['8 bmats', '8 basic materials', '8 basic material'] },
    { vraag: 'How is the upgraded argonaut called?', antwoord: ['Odyssey', 'UV-5c Odyssey'] },




];

let currentQuiz = null;
let currentQuizMessage = null

function scheduleRandomDailyQuiz(client) {
    const randomHour = Math.floor(Math.random() * 24);
    const randomMinute = Math.floor(Math.random() * 60);

    console.log(`🕒 Popquiz planned: ${randomHour}:${randomMinute}`);

    cron.schedule(`* * * * *`, async () => {
        try {
            currentQuiz = popQuestions[Math.floor(Math.random() * popQuestions.length)];
            const channel = await client.channels.fetch(process.env.POPQUIZ_CHANNEL_ID);

            const embed = new EmbedBuilder()
                .setTitle('⏰ | Pop Quiz Time')
                .setDescription(`❓ **Question:**
                    ${currentQuiz.vraag}`)
                .setColor('#DBB434')
            await channel.permissionOverwrites.edit(process.env.ATR_ROLE, { ViewChannel: true, SendMessages: true });

            currentQuizMessage = await channel.send({ embeds: [embed] });
        } catch (err) {
            console.error('Popquiz error:', err.message);
        }
    });
}


module.exports = {
    name: 'clientReady',
    once: true,

    async execute(client) {

        scheduleRandomDailyQuiz(client);
        cron.schedule('0 0 * * *', () => {
            scheduleRandomDailyQuiz(client);
        });
        const channel = await client.channels.fetch(process.env.POPQUIZ_CHANNEL_ID);

        client.on('messageCreate', message => {
            if (message.author.bot || !currentQuiz) return;

            let correct = false;

            if (Array.isArray(currentQuiz.antwoord)) {
                correct = currentQuiz.antwoord.map(a => a.toLowerCase()).includes(message.content.toLowerCase());
            } else {
                correct = message.content.toLowerCase() === currentQuiz.antwoord.toLowerCase();
            }

            if (correct) {
                message.reply('✅ Correct! Well done soldier..')
                    .then(msg => setTimeout(() => msg.delete().catch(() => { }), 5000));

                const oldembed = new EmbedBuilder()
                    .setTitle('⏰ | Pop Quiz Time')
                    .setDescription(`❓ **Question:**
                    ${currentQuiz.vraag}`)
                    .setColor('#DBB434')
                    .setFooter({ text: `Answer: ${currentQuiz.antwoord}` })
                currentQuizMessage.edit({ embeds: [oldembed] })

                addScore(message.author.id, message.author.username);
                currentQuiz = null;

                const leaderboard = getLeaderboard();
                const embed = new EmbedBuilder()
                    .setTitle('🏆 | Leaderboard')
                    .setDescription(leaderboard.map((row, index) => `${index + 1}. <@${row.userId}> - ${row.score}`).join('\n'))
                    .setColor('#DBB434');


                message.channel.send({ embeds: [embed] });
                channel.permissionOverwrites.edit(process.env.ATR_ROLE, { ViewChannel: true, SendMessages: false });

            }
        });
    }
};
