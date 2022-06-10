const { merge } = require('./ansiformat');

function escape(content) {
    return content.replaceAll('`', '`\u200b').replaceAll('@', '@\u200b');
}


module.exports.default = async function (message, offset, obj) {
    const range = ' '.repeat(obj.highlightRange[0] + offset) + '~'.repeat(obj.highlightRange[1] - obj.highlightRange[0]);

    let content = message.content;

    if ('highlight' in obj) {
        content = merge(content, offset, obj.highlight);
    }

    let send = `\`\`\`ansi

${escape(content)}
[0;35m${range}[0;2m

${escape(obj.reason)}
\`\`\``;

    // max's 2000, but 300 sounds reasonable enough
    if (send.length > 300) {
        send = `\`\`\`${escape(obj.reason)}\`\`\``;
    }

    await message.reply(send);
};
