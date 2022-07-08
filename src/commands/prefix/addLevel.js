const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const DataStorage = require('../../util/dataStorage');
const requestTierRoles = require('../../util/requestTierRoles');

// Adds amount of levels to a user
// This works with negative numbers as well
module.exports = {
    name: 'addlevel',
    description: 'Adds specified amount of levels to a user.',
    moderator: true,

    experimental: true,
    arguments: [
        {
            name: 'member',
            type: 'member',
        },

        {
            name: 'amount',
            type: 'number',
        },
    ],
    /**
     * 
     * @param {Discord.Message} message 
     * @param {{member: import('discord.js').GuildMember, amount: number}} args 
     */
    async execute(context, args) {
        if (!DataStorage.storage.people) {
            DataStorage.storage.people = {};
        }

        const person = DataStorage.storage.people[args.member.id];

        let newLevel = 0;

        if (person == undefined || person.level == undefined) {
            newLevel = args.amount;
            await context.reply(`Changed level of ${args.member.user.tag} to ${newLevel}.`);
        }
        else {
            newLevel = person.level + args.amount;
            await context.reply(`Changed level of ${args.member.user.tag} from ${person.level} to ${newLevel}.`);
        }
        requestTierRoles.levelset(args.member, newLevel);
    },
};
