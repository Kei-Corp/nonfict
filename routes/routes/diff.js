const diff = (oldText, newText) => {
    let i = 0, j = 0;
    const ops = [];
    let currentOp = null;
    while (i < oldText.length || j < newText.length) {
        if (oldText[i] !== newText[j]) {
            if (!currentOp) {
                currentOp = { p: i, d: 0, i: '' };
                ops.push(currentOp);
            }
            if (i < oldText.length) {
                currentOp.d++;
                i++;
            }
            if (j < newText.length) {
                currentOp.i += newText[j];
                j++;
            }
        } else {
            currentOp = null;
            i++; j++;
        }
    }
    return ops;
}

const patch = (text, ops) => {
    let result = text;
    for (let {p, d, i} of ops) {
        result = result.slice(0, p) + i + result.slice(p + d);
    }
    return result;
}

module.exports = { diff, patch }