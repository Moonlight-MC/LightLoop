const utility = require('../../util/utility');

module.exports = {
    name: 'backend',
    description: 'Checks Figura backend status.',
    allowInOtherGuilds: true,
    /**
     * 
     * @param {import('discord.js').Message} message 
     */
    async execute(message) {
        const msg = await message.channel.send({
            content: 'Backend Status', embeds: [{
                description: '**0.0.8 Backend**\nš»ā āāā āšļø\n\n**0.1.0 Backend**\nš»ā ā ā ā āšļø',
            }],
        });
        const status = await utility.checkBackendStatus(message.client);
        const icon = status ? 'ā' : 'ā';
        msg.edit({
            content: 'Backend Status', embeds: [{
                description: '**0.0.8 Backend**\nš»ā āāā āšļø\n\n**0.1.0 Backend**\nš»ā ā' + icon + 'ā āšļø',
            }],
        });
    },
};
