const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const { compile } = require('../../message/usage');
const utility = require('../../util/utility');

function getUsage(command) {
    if (command.experimental) {
        return compile(command);
    }
    else {
        return command.usage;
    }
}

// Help command
// Automatically gets information about other commands to build a reply
module.exports = {
    name: 'help',
    usage: '`?help` - Shows this message.',
    allowInOtherGuilds: true,
    /**
     * 
     * @param {Discord.Message} message 
     */
    async execute(message) {

        const isModerator = utility.isModerator(message.member);

        let commands = '**Available commands**\n';
        let modCommands = '**Moderator commands**\n';

        message.client.slashCommands.forEach(command => {
            if (message.guild.id != process.env.MAIN_GUILD && !command.allowInOtherGuilds) return;
            if (command.moderator) {
                modCommands += getUsage(command) + '\n';
            }
            else {
                commands += getUsage(command) + '\n';
            }
        });

        message.client.prefixCommands.forEach(command => {
            if (message.guild.id != process.env.MAIN_GUILD && !command.allowInOtherGuilds) return;
            if (command.moderator) {
                modCommands += getUsage(command) + '\n';
            }
            else {
                commands += getUsage(command) + '\n';
            }
        });

        message.reply({ embeds: [{ description: `${commands}\n${isModerator ? modCommands : ''}` }] });
    },
};
