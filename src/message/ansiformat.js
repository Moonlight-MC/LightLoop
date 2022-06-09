/**
 * 
 * @param {string} content 
 * @param {number} offset 
 * @param {Map} instructions 
 */
module.exports.merge = function (content, offset, instructions) {
    const keys = [...instructions.keys()].sort((a, b) => -(a - b));

    for (let posPos = 0; posPos < keys.length; posPos++) {
        const pos = keys[posPos];

        content = content.substring(0, pos + offset) + instructions.get(pos) + content.substring(pos + offset);
    }

    return '[0;2m' + content;
};
