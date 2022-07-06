const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const { SlashCommandBuilder } = require('@discordjs/builders');
const DataStorage = require('../../util/dataStorage');

// my eyes started crying the second I gazed upon the original command
// so I create it my own way

const options = {
    wait_for_proxy: {
        name: 'Wait for message to be proxied',
        defaults: false,
    },

    alert_when_waiting: {
        name: 'Alert when it\'s waiting for message to be proxied',
        defaults: false,
    },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('usersettings')
        .setDescription('Show or change user specific settings.')
        .addStringOption((option) => option.setName('name').setDescription('The setting to show or change.').setRequired(false).setChoices(Object.entries(options).map(val => [val[1].name, val[0]])))
        .addStringOption((option) => option.setName('value').setDescription('The value to set the setting to.').setRequired(false).setChoices([['true', 'true'], ['false', 'false']])),
    usage: '`/settings [name [value]]` - Show or change user specific settings.',
    allowInOtherGuilds: true,
    /**
     * 
     * @param {Discord.CommandInteraction} interaction 
     */
    async execute(interaction) {
        if (!interaction.guild) return interaction.reply('This command can only be used in your server.');

        if (!DataStorage.usersettings.map) DataStorage.usersettings.map = new Map();
        const id = interaction.guild.id + '-' + interaction.member.id;

        if (!DataStorage.usersettings.map.has(id)) {
            const created = new Map();
            DataStorage.usersettings.map.set(id, created);

            const entries = Object.entries(options);

            for (let i = 0; i < entries.length; i++) {
                created.set(entries[i][0], entries[i][1].defaults);
            }

            DataStorage.save('usersettings');
        }

        const name = interaction.options.getString('name');
        const value = interaction.options.getString('value');
        const stored = DataStorage.usersettings.map.get(id);

        if (name == null && value == null) {
            interaction.reply('```json\n' + Object.entries(options).map(val => `"${val[1].name}": ${stored.get(val[0])}`).join('\n') + '```');
        }
        else if (name != null && value == null) {
            if (name in options) {
                interaction.reply(`"${options[name].name}" is set to ` + stored.get(name) + '.');
            }
            else {
                interaction.reply('That setting does not exist.');
            }
        }
        else if (name != null && value != null) {
            const val = value === 'true' || value === 'yes';
            stored.set(name, val);
            interaction.reply(`"${options[name].name}" has been set to ` + val + '.');
            DataStorage.save('usersettings');
        }
    },
};
