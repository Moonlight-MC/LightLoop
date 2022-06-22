const { registry } = require('./methods/registry.js');
const { pad } = require('../util/utility');

async function transform(message, unparsed, split, config) {
    const ret = Object.create(null);
    const consumeContext = [];

    let argumentPointer = 0;
    let argumentStackPointer = 0;

    for (argumentStackPointer = 0; argumentStackPointer < config.length; argumentStackPointer++) {
        const definition = config[argumentStackPointer];
        const rawArgument = split[argumentPointer] || null;

        const parser = definition.parser || registry[definition.type || 'string'];

        const parseResult = await parser(message, rawArgument === null ? null : rawArgument.value, definition.options || {});

        if (parseResult.fail) {
            if (parseResult.useDefault && ('default' in definition || 'defaultFactory' in definition)) {
                ret[definition.name] = 'default' in definition ? definition.default : await definition.defaultFactory(message);
                consumeContext.push('DEF');
            }
            else {
                return {
                    fail: true,
                    reason: `Parsing error for argument ${definition.name}:\n${pad(parseResult.reason, '    ')}`,
                    highlightedArgument: argumentStackPointer,
                    consumeContext,
                };
            }
        }
        else {
            const consume = !('consume' in parseResult) || parseResult.consume;

            consumeContext.push(consume ? 'CONS' : 'CONT');
            if (consume) {
                argumentPointer += 1;
            }

            ret[definition.name] = parseResult.value;
        }
    }

    if (argumentPointer < split.length) {
        return {
            fail: true,
            reason: 'Too many arguments provided',
            consumeContext,
        };
    }

    return {
        fail: false,
        value: ret,
        consumeContext,
    };
}

module.exports.transform = transform;
