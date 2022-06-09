module.exports.compile = function (definition) {
    let commandUsage = '`' + process.env.PREFIX;
    commandUsage += definition.name;

    const compiledArguments = definition.arguments.map(val => {
        let name = val.name;
        
        if ('type' in val) {
            name += `: ${val.type}`;
        }

        if ('default' in definition || 'defaultFactory' in definition) {
            name = `[${name}]`;
        }
        else {
            name = `<${name}>`;
        }

        return name;
    }).join(' ');

    commandUsage += ' ' + compiledArguments + '` - ' + definition.description;

    return commandUsage;
};
