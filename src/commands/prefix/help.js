const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const { compile } = require('../../message/usage');
const utility = require('../../util/utility');

function getUsage(command) {
    if (command.experimental) {
        return compile(command).join('\n');
    }
    else {
        return command.usage;
    }
}

function commandName(message, arg) {
    const isModerator = utility.isModerator(message.member);
    const commands = Array.from(message.client.prefixCommands.values());

    for (let i = 0; i < commands.length; i++) {
        const command = commands[i];

        if (message.guild.id != process.env.MAIN_GUILD && !command.allowInOtherGuilds) continue;
        if (command.moderator && !isModerator) continue;

        if (arg === command.name) {
            return {
                fail: false,
                value: command,
            };
        }
    }

    return {
        fail: true,
        reason: `No command named '${arg}' was found`,
    };
}

// Help command
// Automatically gets information about other commands to build a reply
module.exports = {
    name: 'help',
    allowInOtherGuilds: true,

    experimental: true,

    overloads: [
        {
            arguments: [],
            description: 'Get all commands',
            /**
             * 
             * @param {Discord.Message} message 
             */
            async execute(context) {

                const isModerator = utility.isModerator(context.author);

                let commands = '**Available commands**\n';
                let modCommands = '**Moderator commands**\n';

                context.client.slashCommands.forEach(command => {
                    if (context.guild.id != process.env.MAIN_GUILD && !command.allowInOtherGuilds) return;
                    if (command.moderator) {
                        modCommands += getUsage(command) + '\n';
                    }
                    else {
                        commands += getUsage(command) + '\n';
                    }
                });

                context.client.prefixCommands.forEach(command => {
                    if (context.guild.id != process.env.MAIN_GUILD && !command.allowInOtherGuilds) return;
                    if (command.moderator) {
                        modCommands += getUsage(command) + '\n';
                    }
                    else {
                        commands += getUsage(command) + '\n';
                    }
                });

                await context.reply({ embeds: [{ description: `${commands}\n${isModerator ? modCommands : ''}` }] });
            },
        },

        {
            arguments: [
                {
                    name: 'what',
                    type: 'command',
                    parser: commandName,
                },
            ],
            description: 'Get a specific command',

            async execute(context, args) {
                await context.reply({ embeds: [{ description: getUsage(args.what) }] });
            },
        },
    ],
};
