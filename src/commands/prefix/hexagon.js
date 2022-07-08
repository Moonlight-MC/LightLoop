const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const hexagonalImage = require('../../util/hexagonImage');

module.exports = {
    name: 'hexagon',
    description: 'Create a hexagonal profile picture.',
    allowInOtherGuilds: true,

    experimental: true,
    arguments: [
        {
            name: 'what',
            type: 'image',
        },
    ],

    /**
     * 
     * @param {import('../../message/context').Context} context 
     * @param {{what: string}} args 
     */
    async execute(context, args) { // eslint-disable-line no-unused-vars
        try {
            const image = await hexagonalImage(args.what);
            await context.reply({
                files: [new Discord.MessageAttachment(
                    image,
                    'avatar.png',
                )],
            });
        }
        catch (err) {
            console.error(err);
            await context.reply('Couldn\'t find an image.');
        }
    },
};
