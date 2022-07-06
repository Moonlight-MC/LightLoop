const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const petPetGif = require('../../util/petpetgif');

module.exports = {
    name: 'pet',
    description: 'Create a pet-pet gif',
    allowInOtherGuilds: true,

    experimental: true,
    arguments: [
        {
            name: 'what',
            type: 'image',
        },

        {
            name: 'speed',
            type: 'number',

            options: {
                coerceRange: false,
                max: 65,
                min: 5,
            },

            default: 18,
        },
    ],
    /**
     * 
     * @param {Discord.Message} message 
     * @param {*} args 
     */
    async execute(context, args) { // eslint-disable-line no-unused-vars
        try {
            const animatedGif = await petPetGif(args.what, {
                resolution: 128,
                framerate: args.speed,
            });

            try {
                await context.reply({
                    files: [new Discord.MessageAttachment(
                        animatedGif,
                        'pet.gif',
                    )],
                });
            }
            catch (e) {
                console.error(e);
            }
        }
        catch (err) {
            await context.reply(err.message);
        }
    },
};
