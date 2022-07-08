const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const getLevelReplyOf = require('../shared/level');

module.exports = {
    name: 'level',
    description: 'Shows Avatar Request Level of a user.',
    allowInOtherGuilds: true,

    experimental: true,
    arguments: [
        {
            name: 'member',
            type: 'member',
        },
    ],
    /**
     * 
     * @param {import('../../message/context').Context} context 
     * @param {{member: import('discord.js').GuildMember}} args 
     */
    async execute(context, args) {

        // Shared command for prefix as well as slash command
        const reply = getLevelReplyOf(args.member.user);

        await context.reply(reply);
    },
};
