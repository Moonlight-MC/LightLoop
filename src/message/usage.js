module.exports.compile = function (definition) {
    const usages = [];

    let overloads;

    if ('arguments' in definition) {
        overloads = [definition];
    }
    else {
        overloads = definition.overloads;
    }

    for (let i = 0; i < overloads.length; i++) {
        let commandUsage = '`' + process.env.PREFIX;
        commandUsage += definition.name;

        const compiledArguments = formatArguments(overloads[i].arguments).join(' ');

        commandUsage += ' ' + compiledArguments + '` - ' + overloads[i].description;
        usages.push(commandUsage);
    }


    return usages;
};


function formatArguments(args) {
    return args.map(val => {
        let name = val.name;
        
        if ('type' in val) {
            name += `: ${val.type}`;
        }

        if ('default' in val || 'defaultFactory' in val) {
            name = `[${name}]`;
        }
        else {
            name = `<${name}>`;
        }

        return name;
    });
}

module.exports.formatArguments = formatArguments;
