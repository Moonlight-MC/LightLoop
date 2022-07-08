const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const DataStorage = require('../../util/dataStorage');

module.exports = {
    name: 'ign',
    description: 'Show Minecraft in game name of a Discord user.',

    experimental: true,
    arguments: [
        {
            name: 'member',
            type: 'member',
        },
    ],
    /**
     * 
     * @param {Discord.Message} message 
     * @param {String[]} args 
     */
    async execute(context, args) { // eslint-disable-line no-unused-vars
        if (!DataStorage.storage.people) DataStorage.storage.people = {};
        if (DataStorage.storage.people[args.member.id] == undefined) DataStorage.storage.people[args.member.id] = {};

        if (DataStorage.storage.people[args.member.id].mcign == undefined) {
            await context.reply(args.member.user.tag + ' does not have a Minecraft in game name connected.');
        }
        else {
            await context.reply(args.member.user.tag + ' is ' + DataStorage.storage.people[args.member.id].mcign + '.');
        }
    },
};
