const Diff = require("./diff")
const Compress = require("./compress")

// 人間が書いたとは思えないスパゲティコード

module.exports = (fastify, options, done) => {
    const { redis } = fastify

    const rand64 = (N) => require('crypto').randomBytes(N).toString('base64').replace("/", "l").substring(0, N)
    const getFormattedDate = () => new Date().toLocaleString();

    const sharp = require('sharp');
    const path = require('path')
    const fs = require('node:fs')
    const { pipeline } = require('node:stream/promises')

    let connectedClients = []
    let luversarray = {}
    let typingarray = {}
    let typinghistory = {}
    let imgsdatas = {}

    let scrollarray = {}
    let connectedClients_B = {}
    let isoffline = {}

    const post = async (req, reply) => {
        if("secret_key" in req.cookies && await redis.exists(req.cookies.secret_key) && await redis.get(req.cookies.secret_key) == req.cookies.username && req.body.trim() && typingarray.hasOwnProperty(req.cookies.username)){
            const rk = rand64(8).replaceAll("/", "l").replaceAll("+", "p")
            const dats = {
                user: req.cookies.username,
                c: req.body.slice(0, 1024).replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll(/\n{3,}/g, "\n\n").replaceAll(/([ 　])[ 　]+/g, "$1").replaceAll("\n", "<br>"),
                t: getFormattedDate(),
                msgid: rk,
                luv: luversarray.hasOwnProperty(req.cookies.username) ? luversarray[req.cookies.username].length : 0,
                dub: 0,
                replys: 0
            }
            if(imgsdatas.hasOwnProperty(req.cookies.username)){
                dats.c += `<img class="max-w-full min-w-16 mt-4" src="/${imgsdatas[req.cookies.username]}">`
            }
            delete imgsdatas[req.cookies.username]
            redis.set(rk, JSON.stringify(dats))
            redis.set(rk + ':history', await Compress(typinghistory[req.cookies.username]))
            if(luversarray.hasOwnProperty(req.cookies.username) && luversarray[req.cookies.username].length != 0){
                redis.sadd(rk + ':luvers', luversarray[req.cookies.username])
                redis.lpush(req.cookies.username + ":notify", luversarray[req.cookies.username].map(_=>JSON.stringify(["luv", rk, dats.c.slice(0, 24) + "…", _])))
                delete luversarray[req.cookies.username]
            }
            let ppp = await redis.get(":all-chars")
            ppp = (parseInt(ppp) && parseInt(ppp) != NaN) ? parseInt(ppp) : 0
            redis.incr(":posts")
            redis.hincrby(":postshis", new Date().toLocaleDateString('sv-SE'), 1)
            redis.set(":all-chars", ppp + req.body.slice(0, 1024).replace(/\n{3,}/g, "\n\n").replace(/([ 　])[ 　]+/g, "$1").length)
            redis.hset(":all-charshis", new Date().toLocaleDateString('sv-SE'), ppp + req.body.slice(0, 1024).replace(/\n{3,}/g, "\n\n").replace(/([ 　])[ 　]+/g, "$1").length)
            redis.set(req.cookies.username + ":chars", parseInt(await redis.get(req.cookies.username + ":chars")) + req.body.slice(0, 1024).replace(/\n{3,}/g, "\n\n").replace(/([ 　])[ 　]+/g, "$1").length)
            redis.set(req.cookies.username + ":times", parseInt(await redis.get(req.cookies.username + ":times")) + typinghistory[req.cookies.username].slice(-1)[0][1] - typinghistory[req.cookies.username][0][1])
            //redis.hmset(rk, dats)
            delete typingarray[req.cookies.username]
            delete typinghistory[req.cookies.username]
            redis.lpush("timeline", rk)
            redis.lpush(req.cookies.username + ":msgs", rk)
            let uhjk = req.cookies.username + await redis.get(req.cookies.username + ":handlename") + req.body.slice(0, 1024)
            if(uhjk.length >= 2){
                for(let i=0; i<uhjk.length-1; i++){
                    redis.sadd(uhjk.slice(i, i+2).toLowerCase(), rk)
                }
            }
            dats.posted = 1
            let p = {}
            p[req.cookies.username] = {}
            p[rk] = dats
            const encoded = await Compress(p)
            for (const client of connectedClients) {
                if (client.readyState == 1) {
                    client.send(encoded);
                }else{
                    connectedClients = connectedClients.filter(_ => _ !== client);
                }
            }
            if(connectedClients_B.hasOwnProperty(req.cookies.username)){
                for (const client of connectedClients_B[req.cookies.username]) {
                    if (client.readyState == 1) {
                        client.send(encoded);
                    }else{
                        connectedClients_B[req.cookies.username] = connectedClients_B[req.cookies.username].filter(_ => _ !== client);
                    }
                }
            }
            await reply.code(200).send("posted!");
            return
        }
        await reply.code(500).send("go f urself");
        return
    }

    const typingHistory = async (req, reply) => {
        let { id } = req.params
        if(id.startsWith("re:")){
            id = id.split(":")[1]
        }
        await reply.code(200).send(await redis.get(id + ":history"))
        return
    }

    fastify.post('/fetch/history/:id/', typingHistory)

    const getTimeline = async (redis, heis = null, start = 0, end = 6) => {
        if(end - start > 48) return {}
        const pastDats = await redis.lrange("timeline", start, end-1)
        const RTpastDats = pastDats.filter(_ => _.startsWith("re:"))
        const nonRTpastDats = pastDats.filter(_ => !_.startsWith("re:"))

        if(pastDats.length >= 1){
            let pastDatsJSON = {}
            let i = 0
            for(pastDat of await redis.mget(nonRTpastDats)){
                if(pastDat == null){redis.lrem("timeline", 0, pastDat);continue}
                let datJSON = JSON.parse(pastDat)
                datJSON.posted = 1
                datJSON.msgid = nonRTpastDats[i]
                if(heis)
                    datJSON.ruc = await redis.sismember(nonRTpastDats[i] + ":luvers", heis)
                    datJSON.dueb = await redis.sismember(nonRTpastDats[i] + ":boosters", heis)
                pastDatsJSON[nonRTpastDats[i]] = datJSON
                i ++ 
            }
            i = 0
            if(RTpastDats.length > 0){
                for(rtpastDat of await redis.mget(RTpastDats.map(_ => _.split(":")[1]))){
                    if(rtpastDat == null){redis.lrem("timeline", 0, RTpastDats[i]);continue}
                    let datJSON = JSON.parse(rtpastDat)
                    datJSON.posted = 1
                    datJSON.msgid = RTpastDats[i]
                    datJSON.whorted = RTpastDats[i].split(":")[2];
                    if(heis)
                        datJSON.ruc = await redis.sismember(RTpastDats[i].split(":")[1] + ":luvers", heis)
                        datJSON.dueb = await redis.sismember(RTpastDats[i].split(":")[1] + ":boosters", heis)
                    pastDatsJSON[RTpastDats[i]] = datJSON
                    i ++ 
                }
            }
            return pastDatsJSON
        }
        return {}
    }

    const getTyping = async (redis) => {
        //return await redis.hgetall("typing")
        return typingarray
    }
    
    const fetchtimeline = async (req, reply) => {
        const { start, end } = req.params
        await reply.code(200)
                .send(await Compress(await getTimeline(redis, req.cookies.username, start, end)))
    }

    const timeline = async (socket, req) => {
        connectedClients.push(socket)
        await socket.send(await Compress(await getTimeline(redis)))
        await socket.send(await Compress(await getTyping(redis)))

        const polling = setInterval(async () => socket.send(await Compress(await getTyping(redis))), 7500)
        socket.on("close", () => {clearInterval(polling); connectedClients = connectedClients.filter(_ => _ !== socket)})
    }

    const typing = async (socket, req) => {
        let text = ""
        let jit
        const { user, key } = req.params
        await socket.send(await Compress(await getTimeline(redis, user)))
        await socket.send(await Compress(await getTyping(redis)))

        const polling = setInterval(async () => socket.send(await Compress(await getTyping(redis))), 7500)
        connectedClients.push(socket)
        
        if(await redis.exists(key) && await redis.get(key) == user){

            socket.on("message", async (data) => {
                if(typingarray.hasOwnProperty(req.cookies.username)){
                    text = typingarray[req.cookies.username]
                }
                let newText = data.toString().slice(0, 500).replaceAll("<", "&lt;").replaceAll(">", "&gt;").replace(/\n{3,}/g, "\n\n").replace(/([ 　])[ 　]+/g, "$1").replaceAll("\n", "<br>")
                if(imgsdatas.hasOwnProperty(req.cookies.username)){
                    newText += `<img class="max-w-full min-w-16 mt-4" src="/${imgsdatas[req.cookies.username]}">`
                }
                let encoded

                if(data.toString().replace(/\s/g, "") == ""){
                    if(jit) clearTimeout(jit)
                    let uheri = imgsdatas[user]
                    delete imgsdatas[user]
                    jit = setTimeout(()=>{
                        delete typingarray[user]
                        typinghistory[user] = []
                        luversarray[user] = []
                        if(imgsdatas.hasOwnProperty(req.cookies.username)){
                            try{
                                fs.unlinkSync(path.join(__dirname, '../static/') + uheri)
                            }catch{
                                
                            }
                        }
                    }, 17500)
                    typingarray[user] = ""
                }else{
                    if(jit) clearTimeout(jit)
                    typingarray[user] = newText
                }
                if(!typinghistory.hasOwnProperty(user)){typinghistory[user] = []}
                let diff = Diff.diff(text, newText)
                typinghistory[user].push([diff, new Date().getTime()])
                encoded = await Compress([user, diff]);
                for (const client of connectedClients) {
                    if (client.readyState == 1) {
                        client.send(encoded);
                    }else{
                        connectedClients = connectedClients.filter(_ => _ !== client);
                    }
                }
                if(connectedClients_B.hasOwnProperty(req.cookies.username)){
                    for (const client of connectedClients_B[req.cookies.username]) {
                        if (client.readyState == 1) {
                            client.send(encoded);
                        }else{
                            connectedClients_B[req.cookies.username] = connectedClients_B[req.cookies.username].filter(_ => _ !== client);
                        }
                    }
                }
                text = newText
            })

            socket.on("close", async () => {
                delete typingarray[user]
                delete typinghistory[user]
                if(imgsdatas.hasOwnProperty(req.cookies.username)){
                    try{
                        fs.unlinkSync(path.join(__dirname, '../static/') + imgsdatas[user])
                        delete imgsdatas[user]
                    }catch{
                        
                    }
                }
                clearInterval(polling);
                connectedClients = connectedClients.filter(_ => _ !== socket);
            })
        }
    }

    const upload = async (req, reply) => {
        if("secret_key" in req.cookies && await redis.exists(req.cookies.secret_key) && await redis.get(req.cookies.secret_key) == req.cookies.username){
            const data = await req.file()
            const rk = rand64(8).replaceAll("/", "l").replaceAll("+", "p")

            await pipeline(data.file, fs.createWriteStream(path.join(__dirname, '../static/') + rk + data.filename))

            if(!fs.existsSync(path.join(__dirname, '../static/') + rk + data.filename)){
                await reply.code(500).send("null")
            }
            try{
                sharp(path.join(__dirname, '../static/') + rk + data.filename)
                    .rotate().webp({quality: 75})
                    .toFile(path.join(__dirname, '../static/') + rk + ".webp", (_, __)=>{console.log(_)})
                setTimeout(async ()=>{
                    try{fs.unlinkSync(path.join(__dirname, '../static/') + rk + data.filename)}catch{}

                    imgsdatas[req.cookies.username] = rk + ".webp"
                    if(typingarray.hasOwnProperty(req.cookies.username)){
                        typingarray[req.cookies.username] += `<img class="max-w-full min-w-16 mt-4" src="/${rk}.webp">`
                        let encoded = {}
                        encoded[req.cookies.username] = typingarray[req.cookies.username]
                        encoded = await Compress(encoded);
                        for (const client of connectedClients) {
                            if (client.readyState == 1) {
                                client.send(encoded);
                            }else{
                                connectedClients = connectedClients.filter(_ => _ !== client);
                            }
                        }
                        if(connectedClients_B.hasOwnProperty(req.cookies.username)){
                            for (const client of connectedClients_B[req.cookies.username]) {
                                if (client.readyState == 1) {
                                    client.send(encoded);
                                }else{
                                    connectedClients_B[req.cookies.username] = connectedClients_B[req.cookies.username].filter(_ => _ !== client);
                                }
                            }
                        }
                    }
                }, 300)
            }catch{
                await reply.code(500).send("invalid data")
                return
            }
            await reply.code(200).send(rk + ".webp")
            return
        }
        await reply.code(500).send("go f urself")
    }

    const uploadicon = async (req, reply) => {
        if("secret_key" in req.cookies && await redis.exists(req.cookies.secret_key) && await redis.get(req.cookies.secret_key) == req.cookies.username){
            const data = await req.file()

            await pipeline(data.file, fs.createWriteStream(path.join(__dirname, '../static/') + data.filename))

            if(!fs.existsSync(path.join(__dirname, '../static/') + data.filename)){
                await reply.code(500).send("null")
            }
            try{
                sharp(path.join(__dirname, '../static/') + data.filename)
                    .resize(512, 512)
                    .rotate().webp({quality: 75})
                    .toFile(path.join(__dirname, '../static/') + req.cookies.username + ".webp", (_, __)=>{console.log(_)})
                setTimeout(()=>{try{fs.unlinkSync(path.join(__dirname, '../static/') + data.filename)}catch{}}, 2000)
            }catch{
                await reply.code(500).send("invalid data")
                return
            }

            await reply.code(200).send("succesfully replaced!")
            return
        }
        await reply.code(500).send("go f urself")
    }

    const deletePost = async (req, reply) => {
        const { id } = req.params
        let hash = JSON.parse(await redis.get(id))
        const un = hash.user

        if("secret_key" in req.cookies && await redis.exists(req.cookies.secret_key) && await redis.get(req.cookies.secret_key) == req.cookies.username){
            if(req.cookies.username == un && await redis.exists(id)){
                let hash = JSON.parse(await redis.get(id))
                const timediff = (new Date().getTime() - new Date(hash.t).getTime()) / 1000;
                if(timediff < 5){
                    redis.del(id)
                    redis.del(id + ':luvers')
                    redis.lrem('timeline', 0, id)
                    redis.lrem(un + ':msgs', 0, id)
                    await reply.code(200).send("deleted!")
                    let p = {}
                    p[id] = {c: ""}
                    encoded = await Compress(p);
                    for (const client of connectedClients) {
                        if (client.readyState == 1) {
                            client.send(encoded);
                        }else{
                            connectedClients = connectedClients.filter(_ => _ !== client);
                        }
                    }
                    if(connectedClients_B.hasOwnProperty(req.cookies.username)){
                        for (const client of connectedClients_B[req.cookies.username]) {
                            if (client.readyState == 1) {
                                client.send(encoded);
                            }else{
                                connectedClients_B[req.cookies.username] = connectedClients_B[req.cookies.username].filter(_ => _ !== client);
                            }
                        }
                    }
                    return
                }
            }
        }
        await reply.code(500).send("go f urself")
        return
    }

    const addLove = async (req, reply) => {
        let { id } = req.params

        if("secret_key" in req.cookies && await redis.exists(req.cookies.secret_key) && await redis.get(req.cookies.secret_key) == req.cookies.username){
            const { username } = req.cookies
            let luv
            if(id.startsWith("re:")){
                id = id.split(":")[1]
            }

            if(await redis.exists(id)){
                let encoded
                let hash = JSON.parse(await redis.get(id))
                if(await redis.sismember(id + ":luvers", username)){
                    await reply.code(200).send("-1")
redis.zincrby("ranking", -1.0, id)
                    await redis.srem(id + ":luvers", username)
                    encoded = JSON.stringify(["ll", id, -1])
                    //if(await redis.hexists(id, "luv")) await redis.hset(id, "luv", luv - 1)
                }else{
                    await reply.code(200).send("1")
redis.zincrby("ranking", -1.0, id)
                    await redis.sadd(id + ":luvers", username)
                    if(req.cookies.username!=hash.user){
                        redis.incr(hash.user + ":how_notify")
                        redis.lpush(hash.user + ":notify", JSON.stringify(["luv", id, hash.c.slice(0, 24) + ((hash.c.length >= 24) ? "…" : ""), req.cookies.username]))
                    }
                    encoded = JSON.stringify(["ll", id, 1])
                    //if(await redis.hexists(id, "luv")) luv = await redis.hincrby(id, "luv", 1)
                }
                if(connectedClients_B.hasOwnProperty(username)){
                    for (const client of connectedClients_B[username]) {
                        if (client.readyState == 1) {
                            client.send(encoded);
                        }else{
                            connectedClients_B[username] = connectedClients_B[username].filter(_ => _ !== client);
                        }
                    }
                }
                hash.luv = await redis.scard(id + ":luvers")
                await redis.set(id, JSON.stringify(hash))
            }else{
                if(!luversarray.hasOwnProperty(username)){luversarray[id] = []}
                if(luversarray[id].includes(username)){
                    await reply.code(200).send("-1")
                    luversarray[id] = luversarray[id].filter(_ => _ != username)
                }else{
                    await reply.code(200).send("1")
                    luversarray[id].push(username)
                }
                luv = luversarray[id].length
                if(luv == 0) luv = null
                const p = JSON.stringify(["l", id, luv])
                setTimeout(()=>{for (const client of connectedClients) {
                    if (client.readyState == 1) {
                        client.send(p);
                    }else{
                        connectedClients = connectedClients.filter(_ => _ !== client);
                    }
                }}, 50)
            }
            return
        }
        await reply.code(500).send("go f urself")
    }
    
    const share = async (socket, req) => {
        const { user, key } = req.params
        if(await redis.exists(key) && await redis.get(key) == user){
            isoffline[user] = 0
            if(connectedClients_B.hasOwnProperty(user)){
                for(client of connectedClients_B[user]){
                    if (client.readyState == 1) {
                        client.send((await redis.get(user + ":w")).toString())
                    }else{
                        connectedClients_B[user] = connconnectedClients_BectedClients[user].filter(_ => _ !== client);
                    }
                }
            }
            socket.on("message", async (data) => {
                if(data.toString().startsWith("[")){
                    if(JSON.parse(data.toString()).every(l => (parseInt(l) != NaN))){
                        scrollarray[user] = data.toString()
                    }
                }else{
                    if(data.toString() == "/" || data.toString().startsWith("/s") || data.toString().startsWith("/p") || data.toString().startsWith("/u")){
                        redis.set(user + ":w", data.toString().replaceAll("<", "&lt;").replaceAll(">", "gt;"))
                    }
                }
                if(connectedClients_B.hasOwnProperty(user)){
                    for(client of connectedClients_B[user]){
                        if (client.readyState == 1) {
                            client.send(data.toString().replaceAll("<", "&lt;").replaceAll(">", "&gt;"));
                        }else{
                            connectedClients_B[user] = connectedClients_B[user].filter(_ => _ !== client);
                        }
                    }
                }
            })
            socket.on("close", () => {
                isoffline[user] = 1
                delete scrollarray[user]
                if(connectedClients_B.hasOwnProperty(user)){
                    for(client of connectedClients_B[user]){
                        if (client.readyState == 1) {
                            client.send("OFFLINE");
                        }else{
                            connectedClients_B[user] = connectedClients_B[user].filter(_ => _ !== client);
                        }
                    }
                }
            })
            socket.send("connected!")
        }
    }

    const watch = async (socket, req) => {
        const { user, key, target } = req.params

        if(await redis.exists(key) && await redis.get(key) == user){
            if(!connectedClients_B.hasOwnProperty(target)){
                connectedClients_B[target] = []
            }
            connectedClients_B[target].push(socket)
            setTimeout(async ()=>{
                socket.send(scrollarray.hasOwnProperty(target) ? scrollarray[target] : "[1280,720,0]")
                socket.send(await redis.get(target + ":w"))
                if(!isoffline.hasOwnProperty(target) || isoffline[target] == 1){
                    socket.send("OFFLINE")
                }
            }, 50)

            socket.on("close", async () => {
                connectedClients_B[target] = connectedClients_B[target].filter(_ => _ !== socket);
            })
        }
    }

    fastify.register(async fastify => fastify.get('/ws/screenshare/:user/:key/', { websocket: true }, share))
    fastify.register(async fastify => fastify.get('/ws/screenwatch/:user/:key/:target/', { websocket: true }, watch))

    fastify.post('/upload/', upload)
    fastify.post('/uploadicon/', uploadicon)
    fastify.post('/fetch/like/:id/', addLove)

    fastify.get('/fetch/tl/:start/:end/', fetchtimeline)
    
    fastify.post('/fetch/delete/:id/', deletePost)

    fastify.register(async fastify => fastify.get('/ws/timeline/', { websocket: true }, timeline))
    fastify.register(async fastify => fastify.get('/ws/typing/:user/:key/', { websocket: true }, typing))
    
    fastify.register(async fastify => fastify.post('/fetch/post/', post))

    done()
}
