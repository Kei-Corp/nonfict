const fs = require('fs')
const path = require('path')
const index = fs.readFileSync(path.join(__dirname, '../html/search.html')).toString()
const index2 = fs.readFileSync(path.join(__dirname, '../html/result.html')).toString()

module.exports = (fastify, options, done) => {
    const { redis } = fastify

    const st = []
    let connectedClients = []

    fastify.get('/s/', async (req, reply) => {
        if("secret_key" in req.cookies && await redis.exists(req.cookies.secret_key) && await redis.get(req.cookies.secret_key) == req.cookies.username){
            let un = req.cookies.username
            let hn = await redis.get(un + ":handlename")

            if(req.query.q && req.query.q != ""){
                let ttt = []
                for(ppp of req.query.q.split(/[\s　]/)){
                    if(ppp.length >= 2){
                        for(let i=0; i<ppp.length-1; i++){
                            ttt.push(ppp.slice(i, i+2).toLowerCase())
                        }
                    }
                }
                dats = await redis.sinter(ttt)
                let pastDatsJSON = {}
                if(dats.length != 0){
                    let i = 0
                    for(pastDat of await redis.mget(dats)){
                        if(pastDat == null){redis.lrem("timeline", 0, pastDat);continue}
                        let datJSON = JSON.parse(pastDat)
                        datJSON.posted = 1
                        datJSON.msgid = dats[i]
                        datJSON.ruc = await redis.sismember(dats[i] + ":luvers", req.cookies.username)
                        datJSON.dueb = await redis.sismember(dats[i] + ":boosters", req.cookies.username)
                        pastDatsJSON[dats[i]] = datJSON
                        await redis.zadd("ranking", datJSON.luv + datJSON.dub * 2.0 + datJSON.replys * 4.0, dats[i])
                        i ++ 
                    }
                }
                redis.incr("howsearch:" + req.query.q)

                reply.type('text/html').code(200).send(index2
                    .replaceAll("[[selfusername]]", un)
                    .replaceAll("[[selfhandlename]]", hn)
                    .replaceAll("[[megens]]", JSON.stringify(pastDatsJSON).replaceAll("`", "'").replaceAll("\"", "\\\"").replaceAll("\'", "\\\'"))
                    .replaceAll("[[q]]", req.query.q))
                if(!req.query.q.includes("\"") && !req.query.q.includes("<") && !req.query.q.includes(">") && !req.query.q.includes("?") && !st.map(_=>_[0]).includes(req.query.q)){st.push([req.query.q, dats.length, await redis.get("howsearch:" + req.query.q)])}
                if(st.length >= 12){st.shift()}
                for(client of connectedClients){
                    if (client.readyState == 1) {
                        client.send(JSON.stringify([req.query.q, dats.length, await redis.get("howsearch:" + req.query.q)]));
                    }else{
                        connectedClients = connectedClients.filter(_ => _ !== client);
                    }
                }
            }else{
                dats = await redis.zrevrange("ranking", 0, 12)
                let pastDatsJSON = {}
                if(dats.length != 0){
                    let i = 0
                    for(pastDat of await redis.mget(dats)){
                        if(pastDat == null){redis.lrem("timeline", 0, pastDat);continue}
                        let datJSON = JSON.parse(pastDat)
                        datJSON.posted = 1
                        datJSON.msgid = dats[i]
                        datJSON.ruc = await redis.sismember(dats[i] + ":luvers", req.cookies.username)
                        datJSON.dueb = await redis.sismember(dats[i] + ":boosters", req.cookies.username)
                        pastDatsJSON[dats[i]] = datJSON
                        i ++ 
                    }
                }
                let html = index
                            .replaceAll("[[selfusername]]", un)
                            .replaceAll("[[selfhandlename]]", hn)
                            .replaceAll("[[megens]]", JSON.stringify(pastDatsJSON).replaceAll("`", "'").replaceAll("\"", "\\\"").replaceAll("\'", "\\\'"))
                            
                reply.type('text/html').code(200).send(html)
            }
        }else{
            await reply.redirect("/")
        }
        return 
    })

    const watch = async (socket, req) => {
        const { user, key } = req.params
        
        if(await redis.exists(key) && await redis.get(key) == user){
            connectedClients.push(socket)
            socket.send(JSON.stringify(st))
            socket.on("close", () => {
                for(client of connectedClients){
                    if (client.readyState == 1) {
                        client.send("OFFLINE");
                    }else{
                        connectedClients = connectedClients.filter(_ => _ !== client);
                    }
                }
            })
        }
    }
    
    fastify.register(async fastify => fastify.get('/ws/searchwatch/:user/:key/', { websocket: true }, watch))

    done()
}
