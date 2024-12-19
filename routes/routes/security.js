module.exports = async (redis, username) => {
    redis.lpush(username + ":log", new Date().getTime())
    if(await redis.llen(username + ":log") >= 32){
        const L = ((t) => t.slice(0, -1).map((p, i) => p - t[i+1]))(await redis.lrange(username + ":log", 0, 32))

        const avg = L.reduce((x, y) => x + y) / L.length
        const std = Math.sqrt(L.map(x => (x - avg) * (x - avg)).reduce((x, y) => x + y) / L.length)
        console.log(avg)
        console.log(std / avg)
        redis.del(username + ":log")
    }
}