const CommandParseError = require('../commandParseError');

module.exports = {
    type: 'channel',
    validate: async (value, options, client) => {
        let id = value;
        // get discord channel id from mention string
        if (value.startsWith('<#') && value.endsWith('>')) {
            id = value.substring(2, value.length - 1);
        }
        try {
            const channel = await client.channels.fetch(id);
            return channel;
        }
        catch {
            throw new CommandParseError(`"${value}" is not a valid channel.`);
        }
    },
};
