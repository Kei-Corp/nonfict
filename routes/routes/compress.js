const base122 = require('./base122');
const zstd = require('@mongodb-js/zstd');

module.exports = async (data) => {
    if(Buffer.from(JSON.stringify(data)).length < 126) return JSON.stringify(data);
    const buffer = (typeof data == "object") ? 
                Buffer.from(JSON.stringify(data)) : 
                Buffer.from(data);
    const compressed = await zstd.compress(buffer, 23);
    const encoded = base122.utf8DataToString(base122.encode(compressed));

    return encoded;
}