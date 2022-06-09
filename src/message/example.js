module.exports = {
    // the name of the command
    name: 'exerimental',

    // the flag that indicates that this command uses the new message parser
    experimental: true,

    // the description
    // this is appended into help's command usage
    description: 'This command tests the experimental argument thing',

    arguments: [
        // an array of arguments

        {
            // the name of the argument
            name: 'spam',

            // the type or parser of the argument
            // 'type' is an index on /methods/registry
            // 'parser' is the raw function that would be fetched by 'type'
            // 'parser' is essentially 'type' except that it can have an arbitrary function
            // however 'type' should still be defined for the help command

            // 'parser' precedes 'type'
            // 'type' defaults to 'string'
            type: 'number',
            parser: async (_message, _raw, options) => {
                return { fail: false, value: options.value };
            },

            // 'default' is the raw value
            // 'defaultFactory' is the function that gets called to get the default value

            // 'default' precedes 'defaultFactory'
            default: 0,
            defaultFactory: async (message) => message.author,

            // 'options' are the options passed into the parser
            // it's values depend on the used parser

            // 'options' defaults to {}
            options: {
                value: 'b',
            },
        },
    ],

    async execute(message, args) {
        // args are the arguments processed

        console.log(args);
    },
};
