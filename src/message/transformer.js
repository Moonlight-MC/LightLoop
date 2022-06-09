const { registry } = require('./methods/registry.js');
const { split } = require('./parser.js');


async function transform(message, unparsed, config) {
    const result = split(unparsed);
    let splitted;
    if (result.fail) {
        return result;
    }
    else {
        splitted = result.value;
    }

    const ret = Object.create(null);

    let argumentPointer = 0;
    let argumentStackPointer = 0;

    for (argumentStackPointer = 0; argumentStackPointer < config.length; argumentStackPointer++) {
        const definition = config[argumentStackPointer];
        const rawArgument = splitted[argumentPointer] || null;

        const parser = definition.parser || registry[definition.type || 'string'];

        const parseResult = await parser(message, rawArgument === null ? null : rawArgument.value, definition.options || {});

        if (parseResult.fail) {
            if (parseResult.useDefault && 'default' in definition) {
                ret[definition.name] = definition.default;
            }
            else {
                let range;

                if (rawArgument === null) {
                    range = [unparsed.length + 1, unparsed.length + 5];
                }
                else {
                    range = [rawArgument.start, rawArgument.start + rawArgument.value.length + (rawArgument.quoted ? 2 : 0)];
                }

                return {
                    fail: true,
                    reason: `Parsing error for argument ${definition.name}:\n${parseResult.reason}`,
                    highlightRange: range,
                };
            }
        }
        else {
            if (!('consume' in parseResult) || parseResult.consume) {
                argumentPointer += 1;
            }

            ret[definition.name] = parseResult.value;
        }
    }

    if (argumentStackPointer !== splitted.length) {
        return {
            fail: true,
            reason: 'Too many arguments provided',
            highlightRange: [splitted[argumentStackPointer].start, unparsed.length],
        };
    }

    return {
        fail: false,
        value: ret,
    };
}

module.exports.transform = transform;
