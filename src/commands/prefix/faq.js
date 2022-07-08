const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const utility = require('../../util/utility');
const DataStorage = require('../../util/dataStorage');

module.exports = {
    name: 'faq',
   
    moderator: true,
    helper: true,

    experimental: true,

    overloads: [
        {
            description: 'View all entries in the faq',
            arguments: [],

            /**
             * 
             * @param {import('../../message/context').Context} context 
             */
            async execute(context) {
                if (!DataStorage.storage.faq) DataStorage.storage.faq = new Map();

                let length = 0;
                const lists = [''];
                DataStorage.storage.faq.forEach((value, key, map) => { // eslint-disable-line no-unused-vars
                    const line = `Q:\`${key}\`\nA:\`${value}\`\n\n`;
                    length += line.length;
                    if (length > 4000) {
                        lists.push('');
                        length = 0;
                    }
                    lists[lists.length - 1] += line;
                });
                for (const list of lists) {
                    await context.reply(utility.buildEmbed(list == '' ? 'FAQ is empty.' : list));
                }
            },
        },

        {
            description: 'Remove entry to or from the FAQ. Space: `_`, Underscore: `\\_`, Code: `´` (forwardtick!), Split: `%`.',
            arguments: [
                {
                    name: 'key',
                    type: 'string',
                },
            ],

            /**
             * 
             * @param {import('../../message/context').Context} context 
             * @param {{key: string}} args 
             */
            async execute(context, args) {
                if (!DataStorage.storage.faq) DataStorage.storage.faq = new Map();

                if (DataStorage.storage.faq.has(args.key.toLowerCase())) {
                    DataStorage.storage.faq.delete(args.key.toLowerCase());
                    DataStorage.save('storage');
                    await context.reply(`Removed \`${args.key}\` from the FAQ.`);
                }
                else {
                    await context.reply(utility.buildEmbed(`Could not find \`${args.key}\` in the FAQ.`));
                }
            },
        },

        {
            description: 'Add entry to the FAQ. Space: `_`, Underscore: `\\_`, Code: `´` (forwardtick!), Split: `%`.',

            arguments: [
                {
                    name: 'key',
                    type: 'string',
                },
        
                {
                    name: 'value',
                    type: 'string',
                },
            ],
            
            /**
             * 
             * @param {import('../../message/context').Context} context 
             * @param {{key: string, value: string}} args 
             */
            async execute(context, args) {
                if (!DataStorage.storage.faq) DataStorage.storage.faq = new Map();

                DataStorage.storage.faq.set(args.key.toLowerCase(), args.value);
                DataStorage.save('storage');
                await context.reply(`Added \`${args.key}\` to the FAQ.`);
            },
        },
    ],
};
