const DataStorage = require('../../util/dataStorage');

module.exports = {
    name: 'scamlist',
    description: 'Adds, removes, or shows elements on the Scam list.',
    moderator: true,
    /**
     * 
     * @param {import('discord.js').Message} message 
     * @param {String[]} args 
     */
    async execute(message, args) {

        if (DataStorage.storage.scamfilter == undefined) DataStorage.storage.scamfilter = [];

        const domain = args[0];

        // No arguments, show list
        if (!domain) {
            const scamdomains = '`' + (DataStorage.storage.scamfilter.toString()).replaceAll(',', '`\n`') + '`';
            message.reply(scamdomains == '``' ? 'No domains are in the scam list yet.' : scamdomains);
        }
        // Domain exists, remove
        else if (DataStorage.storage.scamfilter.includes(domain)) {
            DataStorage.storage.scamfilter = DataStorage.storage.scamfilter.filter(x => x != domain);
            message.reply('Removed `' + domain + '` from the scam list.');
        }
        // Domain doesnt exist, add
        else {
            DataStorage.storage.scamfilter.push(domain);
            message.reply('Added `' + domain + '` to the scam list.');
        }
        DataStorage.save('storage');
    },
};
