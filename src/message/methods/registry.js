const utility = require('../../util/utility');

function stateless(transformer) {
    return async (_message, argument, options) => {
        // the stateless transformer has no other way to provide
        // the argument other than the argument itself
        // so we check if it has been provided in the first place here

        if (argument === null) {
            return {
                fail: true,
                reason: 'Argument not provided',
                useDefault: true,
            };
        }

        return transformer(argument, options);
    };
}
const USER_MENTION_REGEX = /<@([0-9]{18})>/;

function isNumeric(value) {
    return /^\d+$/.test(value);
}

function matchID(str) {
    const match = USER_MENTION_REGEX.exec(str);

    if (match !== null) {
        return match[1];
    }
    else if (str.length === 18 && isNumeric(str)) {
        return str;
    }

    return null;
}


module.exports.registry = {
    string: stateless((argument, options) => {
        options = Object.assign({
            maxLength: null,
        }, options);

        if (options.maxLength !== null && options.maxLength < argument.length) {
            return {
                fail: true,
                reason: `Argument exceeds maximum length: ${options.maxLength}`,
            };
        }

        return {
            fail: false,
            value: argument,
        };
    }),

    number: stateless((argument, options) => {
        options = Object.assign({
            coerceRange: true,
            max: null,
            min: null,
            aliases: Object.create(null),
        }, options);

        let number;
        if (argument in options.aliases) {
            number = options.aliases[argument];
        }
        else {
            number = parseFloat(argument);
        }

        if (isNaN(number)) {
            return {
                fail: true,
                reason: 'Cannot parse into a number',
            };
        }
        if (options.coerceRange) {
            if (options.max !== null) {
                number = Math.min(number, options.max);
            }

            if (options.min !== null) {
                number = Math.max(number, options.min);
            }
        }
        else {
            if (options.max < number) {
                return {
                    fail: true,
                    reason: `Number exceeds maximum allowed: ${options.max}`,
                };
            }

            if (options.min > number) {
                return {
                    fail: true,
                    reason: `Number exceeds minimum allowed: ${options.max}`,
                };
            }
        }

        return {
            fail: false,
            value: number,
        };
    }),

    boolean: stateless((argument, options) => {
        options = Object.assign({
            truthy: ['true', 'yes', 'ye', 'y'],
            falsey: ['false', 'no'],
        }, options);

        if (options.truthy.includes(argument)) {
            return {
                fail: false,
                value: true,
            };
        }

        if (options.falsey.includes(argument)) {
            return {
                fail: false,
                value: false,
            };
        }

        return {
            fail: true,
            reason: `Could not identify "${argument}"`,
        };
    }),
    /**
     * 
     * @param {import('discord.js').Message} message 
     * @param {string} argument 
     * @param {*} options 
     */
    member: async (message, argument, options) => {
        options = Object.assign({
            tryReply: true,
            forceNonWebhook: true,
        }, options);

        const failure = [];

        if (options.tryReply) {
            try {
                const replied = await message.fetchReference();

                if ((!replied.webhookId) || !options.forceNonWebhook) {
                    // the reason why webhooks are disallowed by default
                    // is because a lot of the command's code can depend on the user not being a webhook
                    // so we force the command to acknowledge webhooks

                    return {
                        fail: false,
                        consume: false,
                        value: replied.author,
                    };
                }
                else {
                    failure.push('This argument does not support selecting webhooks');
                }
            }
            catch (_) {
                // we tried

                failure.push('Fetching replied message failed');
            }
        }

        if (argument === null) {
            failure.push('Argument not provided');

            return {
                fail: true,
                reason: failure.join('\n'),
                useDefault: true,
            };
        }
        
        const result = matchID(argument);
        if (result !== null) {
            try {
                const user = await message.guild.members.fetch(result);
                return {
                    fail: false,
                    value: user,
                };
            }
            catch (_) {
                // doesn't exist or malformed
                failure.push('Could not find mentioned user');
            }
        }
        else {
            failure.push('Argument is not a mention');
        }

        return {
            fail: true,
            reason: failure.join('\n'),
        };
    },

    image: async (message, argument, options) => {
        options = Object.assign({
            tryRepliedContext: true,
            tryUrl: true,
            tryAttachment: true,
            tryMention: true,
            tryAuthor: true,
        }, options);
        /**
         * 
         * @param {import('discord.js').Message} context
         */
        function fetchOnContext(context, refer) {
            if (options.tryAuthor) {
                const url = context.author.displayAvatarURL({ format: 'png' });

                return {
                    fail: false,
                    value: url,
                };
            }
            
            if (options.tryAttachment) {
                if (context.attachments.length > 0) {
                    const url = context.attachments.first().url;

                    return {
                        fail: false,
                        value: url,
                    };
                }
                else {
                    failure.join(`${refer} has no attachments`);
                }
            }

            return null;
        }

        const failure = [];

        if (options.tryRepliedContext) {
            try {
                const replied = await message.fetchReference();

                const result = fetchOnContext(replied, 'replied message');

                if (result !== null) {
                    return {
                        fail: false,
                        consume: false,
                        value: result.value,
                    };
                }

            }
            catch (_) {
                // we tried

                failure.push('Fetching replied message failed');
            }
        }

        if (options.tryMention) {

            const result = matchID(argument);
            if (result !== null) {
                try {
                    const user = await message.guild.members.fetch(result);
                    const url = user.displayAvatarURL({ format: 'png' });

                    return {
                        fail: false,
                        value: url,
                    };
                }
                catch (_) {
                    // doesn't exist or malformed
                    failure.push('Could not find mentioned user');
                }
            }
            else {
                failure.push('Argument is not a mention');
            }
        }

        if (options.tryUrl) {
            const url = utility.getURLs(argument ?? '')?.at(0);

            if (url) {
                return {
                    fail: false,
                    value: url,
                };
            }
            else {
                failure.join('Argument is not an Url');
            }
        }

        const fetchResult = fetchOnContext(message, 'message');

        if (fetchResult !== null) {
            return {
                fail: false,
                consume: false,
                value: fetchResult.value,
            };
        }

        return {
            fail: true,
            reason: failure.join('\n'),
        };
    },

};
