const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const utility = require('../../util/utility');

// I cannot test this command so I recommend testing it
module.exports = {
    name: 'backend',
    description: 'Checks Figura backend status.',
    allowInOtherGuilds: true,

    experimental: true,
    arguments: [],
    /**
     * 
     * @param {Discord.Message} message 
     */
    async execute(context) {
        const msg = await context.send({
            content: 'Backend Status', embeds: [{
                description: '💻● ● ● ● ●🗄️',
            }],
        });
        const status = await utility.checkBackendStatus(context.client);
        const icon = status ? '✅' : '❌';
        await msg.edit({
            content: 'Backend Status', embeds: [{
                description: '💻● ●' + icon + '● ●🗄️',
            }],
        });
    },
};
