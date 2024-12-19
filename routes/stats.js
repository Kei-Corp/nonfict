module.exports = (fastify, options, done) => {
    const { redis } = fastify

    fastify.get('/stats/', async (req, reply) => {
        await reply.code(200).send(JSON.stringify({
            uzrs: await redis.scard("users"),
            uzrshis: await redis.hgetall(":howmuchusers-his"),
            chars: await redis.get(":all-chars"),
            chrshis: await redis.hgetall(":all-charshis"),
            posts: await redis.get(":posts"),
            postshis: await redis.hgetall(":postshis"),
            mems: process.memoryUsage().rss
        }))
    })
    done()
}
