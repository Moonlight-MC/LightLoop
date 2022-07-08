module.exports = {
    // the name of the command
    name: 'exerimental',

    // the flag that indicates that this command uses the new message parser
    experimental: true,

    // the description
    // this is appended into help's command usage
    description: 'This command tests the experimental argument thing',

    // the arguments
    // 'arguments' is a single array of arguments, which executes the main-level 'execute' function
    // 'overloads' is an array which takes an object with it's own arguments, description and executor

    // 'arguments' precedes 'overloads'
    arguments: [
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
            parser: async (_context, _raw, options) => {
                return { fail: false, value: options.value };
            },

            // 'default' is the raw value
            // 'defaultFactory' is the function that gets called to get the default value

            // 'default' precedes 'defaultFactory'
            default: 0,
            defaultFactory: async (context) => context.author,

            // 'options' are the options passed into the parser
            // it's values depend on the used parser

            // 'options' defaults to {}
            options: {
                value: 'b',
            },
        },
    ],

    overloads: [
        {
            arguments: [],

            async execute(context, args) {
                console.log(args);
            },
        },
    ],


    // note: this function should ALWAYS await the promises it creates
    // because cleanup code is run after it
    async execute(context, args) {
        // args are the arguments processed

        console.log(args);
    },
};
