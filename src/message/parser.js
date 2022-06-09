function isntCollectable(char) {
    return char === ' ' || char === '\n';
}

function isCollectable(char) {
    return !isntCollectable(char);
}

function isQuotes(char) {
    return char === '"';
}

/**
 * 
 * @param {string} content 
 */
function split(content) {
    const ret = [];

    const addLast = (el) => ret[ret.length - 1].value += el;

    let isQuoted = false;
    let isCollecting = false;

    for (let pos = 0; pos < content.length; pos++) {
        const char = content.charAt(pos);

        if (isCollecting) {
            const determiner = isQuoted ? isQuotes : isntCollectable;

            if (determiner(char)) {
                isCollecting = false;
            }
            else {
                addLast(char);
            }
        }
        else if (isCollectable(char)) {
            // we were waiting to reach a collectable char

            isCollecting = true;

            if (isQuotes(char)) {
                isQuoted = true;
                ret.push({
                    start: pos,
                    value: '',
                    quoted: true,
                });
            }
            else {
                isQuoted = false;
                ret.push({
                    start: pos,
                    value: char,
                    quoted: false,
                });
            }
        }
    }

    if (isCollecting && isQuoted) {
        const last = ret[ret.length - 1].start;
        const map = new Map();

        map.set(last, '[2;35m');
        map.set(last + 1, '[0;2m');

        return {
            fail: true,
            reason: 'Unclosed quotation mark',
            highlightRange: [last, content.length],
            highlight: map,
        };
    }

    return {
        fail: false,
        value: ret,
    };
}

module.exports.split = split;
