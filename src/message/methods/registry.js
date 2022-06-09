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

module.exports.registry = {
    string: stateless((argument, options) => {
        options = Object.assign(options, {
            maxLength: null,
        });

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
        options = Object.assign(options, {
            coerceRange: true,
            max: null,
            min: null,
        });

        let number = parseFloat(argument);

        if (isNaN(number)) {
            return {
                fail: true,
                reason: 'Cannot parse into a number',
            };
        }
        if (options.coerceRange) {
            if (options.max === null) {
                number = Math.min(number, options.max);
            }

            if (options.min === null) {
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
        options = Object.assign(options, {
            truthy: ['true', 'yes', 'ye', 'y'],
            falsey: ['false', 'no'],
        });

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
        options = Object.assign(options, {
            tryReply: true,
            forceNonWebhook: true,
        });

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
                reason: failure,
                useDefault: true,
            };
        }
        
        const regex = /<@([0-9]{18})>/;
        const result = regex.exec(argument);
        if (result !== null) {
            try {
                const user = await message.guild.members.fetch(result[1]);
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

    image: async () => {
        /* options = Object.assign(options, {
            tryRepliedUser: true,
            tryUrl: true,
            tryAttachment: true,
            tryReply: true,
        }); */

        return {
            fail: false,
            value: 'ee',
        };
    },

};
