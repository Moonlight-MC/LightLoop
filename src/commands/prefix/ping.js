const Discord = require('discord.js'); // eslint-disable-line no-unused-vars

module.exports = {
    name: 'ping',
    usage: '`?ping` - Ping command for testing.',
    allowInOtherGuilds: true,

    experimental: true,
    arguments: [],
    /**
     * 
     * @param {Discord.Message} message 
     */
    async execute(context) {
        await context.reply('Pong!');
    },
};
