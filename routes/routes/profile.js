const path = require('path')
const fs = require('fs')
const Compress = require("./compress")
const Diff = require("./diff")

const u = fs.readFileSync(path.join(__dirname, '../html/profile.html')).toString()
const p = fs.readFileSync(path.join(__dirname, '../html/post.html')).toString()
const ft = fs.readFileSync(path.join(__dirname, '../html/followers.html')).toString()

module.exports = (fastify, options, done) => {
    const { redis } = fastify

    const formatTime = diffy => {
        const units = [
            { unit: '年', value: diffy.getUTCFullYear() - 1970 },
            { unit: 'ヶ月', value: diffy.getUTCMonth() },
            { unit: '日', value: diffy.getUTCDate() - 1 },
            { unit: '時間', value: diffy.getUTCHours() },
            { unit: '分', value: diffy.getUTCMinutes() },
            { unit: '秒', value: Math.floor(diffy.getTime() / 1000) % 60 }
        ];
        for (let i = 0; i < units.length-1; i++) {
            if (units[i].value) return units[i].value + units[i].unit + units[i+1].value + units[i+1].unit;
        }
        return Math.floor(diffy.getTime() / 1000) % 60 + '秒'
    };

    const formatTime2 = t => `${t.getUTCFullYear()}年${t.getUTCMonth()}月${t.getUTCDate()}日 ${t.getUTCHours()}:${t.getUTCMinutes()}`

    const user = async (req, reply) => {
        if("secret_key" in req.cookies && await redis.exists(req.cookies.secret_key) && await redis.get(req.cookies.secret_key) == req.cookies.username){
            const { username } = req.params
            let un = req.cookies.username
            if(!await redis.exists(username + ":bio")){await reply.callNotFound(); return}
            let hn = await redis.get(un + ":handlename")
            let html = u
                        .replaceAll("[[selfusername]]", un)
                        .replaceAll("[[selfhandlename]]", hn)
                        .replaceAll("[[username]]", username)
                        .replaceAll("[[followers]]", await redis.scard(username + ":followers"))
                        .replaceAll("[[followees]]", await redis.scard(username + ":followees"))
                        .replaceAll("[[handlename]]", await redis.get(username + ":handlename"))
                        .replaceAll("[[isurl]]", await redis.exists(username + ":url") ? ((await redis.get(username + ":url")).trim() == "" ? "hidden" : ""): "hidden")
                        .replaceAll("[[url]]", await redis.exists(username + ":url") ? (await redis.get(username + ":url")).trim().replaceAll(">", "&gt;").replaceAll("<", "&lt;") : "")
                        .replaceAll("[[bio]]", (await redis.get(username + ":bio")).replaceAll(/((?<!href="|href='|src="|src=')(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, "<a href='$1' class='text-emerald-500'>$1</a>"))
                        .replaceAll("[[basebio]]", (await redis.get(username + ":bio")).replaceAll("<br>", "\n"))
                        .replaceAll("[[chars]]", parseInt(await redis.get(username + ":chars")))
                        .replaceAll("[[charaverage]]", (parseInt(await redis.get(username + ":chars")) / Math.max(await redis.llen(username + ":msgs"), 1)).toFixed(1))
                        .replaceAll("[[times]]", formatTime(new Date(parseInt(await redis.get(username + ":times")))))
                        .replaceAll("[[button]]", (un == username) ? `<a id="sign-up-button" href="#edit" class="absolute right-2 hover:text-emerald-600 box-border block text-lg py-1 px-4 font-semibold border-emerald-500 border-2 text-emerald-500 text-center">
                                    編集
                                </a>`: (!await redis.sismember(username + ":followers", un) ? `<button id="follow-up-button" class="absolute right-2 hover:bg-emerald-600 box-border block text-lg py-1 px-4 font-semibold bg-emerald-500 text-white text-center">
                                    フォロー
                                </button>`: `<button id="follow-up-button" class="absolute right-2 hover:border-emerald-600 box-border block text-lg py-0.5 px-4 font-semibold border-emerald-500 border-2 text-emerald-500 text-center">
                                    リムーブ
                                </button>`))

            await reply.type('text/html').code(200).send(html)
        }else{
            await reply.redirect("/")
        }
        return
    }

    const fetchuser = async (req, reply) => {
        if("secret_key" in req.cookies && await redis.exists(req.cookies.secret_key) && await redis.get(req.cookies.secret_key) == req.cookies.username){
            const { username } = req.params
            const { start, end } = req.params
            if(end - start > 48){
                await reply.code(200).send(await Compress({}))
                return
            }

            const pastDats = await redis.lrange(username + ":msgs", start, end)
            const RTpastDats = pastDats.filter(_ => _.startsWith("re:"))
            const nonRTpastDats = pastDats.filter(_ => !_.startsWith("re:"))
    
            if(pastDats.length >= 1){
                let pastDatsJSON = {}
                let i = 0
                for(pastDat of await redis.mget(nonRTpastDats)){
                    if(pastDat == null){redis.lrem(username + ":msgs", 0, pastDat);continue}
                    let datJSON = JSON.parse(pastDat)
                    datJSON.posted = 1
                    datJSON.msgid = nonRTpastDats[i]
                    datJSON.ruc = await redis.sismember(nonRTpastDats[i] + ":luvers", req.cookies.username)
                    datJSON.dueb = await redis.sismember(nonRTpastDats[i] + ":boosters", req.cookies.username)
                    pastDatsJSON[nonRTpastDats[i]] = datJSON
                    i ++ 
                }
                i = 0
                if(RTpastDats.length > 0){
                    for(rtpastDat of await redis.mget(RTpastDats.map(_ => _.split(":")[1]))){
                        if(rtpastDat == null){redis.lrem(username + ":msgs", 0, RTpastDats[i]);continue}
                        let datJSON = JSON.parse(rtpastDat)
                        datJSON.posted = 1
                        datJSON.msgid = RTpastDats[i]
                        datJSON.whorted = username;
                        datJSON.ruc = await redis.sismember(RTpastDats[i].split(":")[1] + ":luvers", req.cookies.username)
                        datJSON.dueb = await redis.sismember(RTpastDats[i].split(":")[1] + ":boosters", req.cookies.username)
                        pastDatsJSON[RTpastDats[i]] = datJSON
                        i ++ 
                    }
                }
                await reply.code(200).send(await Compress(pastDatsJSON))
                return pastDatsJSON
            }
            await reply.code(200).send(await Compress({}))
        }
    }

    const edit = async (req, reply) => {
        if("secret_key" in req.cookies && await redis.exists(req.cookies.secret_key) && await redis.get(req.cookies.secret_key) == req.cookies.username){
            await redis.set(req.cookies.username + ":handlename", JSON.parse(req.body)["handlename"].slice(0, 30).replace("<", "&lt;").replace(">", "&gt;"))
            await redis.set(req.cookies.username + ":bio", JSON.parse(req.body)["bio"].slice(0, 500).replace(/\n{3,}/g, "\n\n").replace(/([ 　])[ 　]+/g, "$1").replace("<", "&lt;").replace(">", "&gt;").replaceAll("\n", "<br>"))
            let url = JSON.parse(req.body)["url"].slice(0, 100).replaceAll("\n", "").replace("<", "&lt;").replace(">", "&gt;")
            if(!url.startsWith("http") && url.trim()) url = "https://" + url
            await redis.set(req.cookies.username + ":url", url)

            await reply.code(200).send("success")
        }
        await reply.code(500).send("failed")
    }

    const postget = async (req, reply) => {
        if("secret_key" in req.cookies && await redis.exists(req.cookies.secret_key) && await redis.get(req.cookies.secret_key) == req.cookies.username){
            let { id } = req.params
            if(id.startsWith("re:")){
                id = id.split(":")[1]
                await reply.redirect("/p/" + id)
                return
            }
            if(!await redis.exists(id)){await reply.callNotFound(); return}

            let un = req.cookies.username
            let hn = await redis.get(un + ":handlename")
            let ps = JSON.parse(await redis.get(id))
            if(ps.toreply){
                await reply.redirect("/p/" + ps.toreply)
                return
            }
            let html = p
                        .replaceAll("[[selfusername]]", un)
                        .replaceAll("[[selfhandlename]]", hn)
                        .replaceAll("[[id]]", id)
                        .replaceAll("[[username]]", ps.user)
                        .replaceAll("[[content]]", ps.c.replaceAll(/((?<!href="|href='|src="|src=')(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, "<a href='$1' class='text-emerald-500'>$1</a>"))
                        .replaceAll("[[handlename]]", await redis.get(ps.user + ":handlename"))
                        .replaceAll("[[date]]", formatTime2(new Date(ps.t)))
                        .replaceAll("[[lnum]]", (ps.luv == 0 || ps.luv == null) ? "": ps.luv)
                        .replaceAll("[[bnum]]", (ps.dub == 0 || ps.dub == null) ? "": ps.dub)
                        .replaceAll("[[cnum]]", (ps.replys == 0 || ps.replys == null) ? "": ps.replys) //ps.dub == 0 ? "": ps.dub)
                        .replaceAll("[[hidden1]]", await redis.sismember(id + ":luvers", un) ? "hidden" : "")
                        .replaceAll("[[hidden2]]", await redis.sismember(id + ":luvers", un) ? "" : "hidden")
                        .replaceAll("[[rose]]", await redis.sismember(id + ":luvers", un) ? "text-rose-500" : "")
                        .replaceAll("[[violet]]", await redis.sismember(id + ":boosters", un) ? "text-violet-500" : "")
                        .replaceAll("[[button]]", (un == ps.user) ? "": (!await redis.sismember(ps.user + ":followers", un) ? `<button id="follow-up-button" class="absolute right-6 top-4 hover:bg-emerald-600 box-border block text-lg py-1 px-4 font-semibold bg-emerald-500 text-white text-center">
                        フォロー
                    </button>`: `<button id="follow-up-button" class="absolute right-6 top-4 hover:border-emerald-600 box-border block text-lg py-0.5 px-4 font-semibold border-emerald-500 border-2 text-emerald-500 text-center">
                        リムーブ
                    </button>`))

            await reply.code(200).type('text/html').code(200).send(html)
        }else{
            await reply.redirect("/")
        }
    }

    let connectedClients = {}
    let typingarray = {}
    let typinghistory = {}

    const wewillreply = async (socket, req) => {
        const { user, key, id } = req.params
        let text = ""
        if(await redis.exists(key) && await redis.get(key) == user){
            let jit
            if(!typingarray.hasOwnProperty(id)) typingarray[id] = {}; typinghistory[id] = {}
            if(!connectedClients.hasOwnProperty(id)) connectedClients[id] = []
            connectedClients[id].push(socket)
            const polling = setInterval(async () => socket.send(await Compress(typingarray[id])), 7500)
            
            const pastDats = await redis.lrange(id + ":replys", 0, 64)
            if(pastDats.length >= 1){
                let pastDatsJSON = {}
                let i = 0
                for(pastDat of await redis.mget(pastDats)){
                    if(pastDat == null){redis.lrem(id + "replys", 0, pastDat);continue}
                    let datJSON = JSON.parse(pastDat)
                    datJSON.posted = 1
                    datJSON.msgid = pastDats[i]
                    datJSON.ruc = await redis.sismember(pastDats[i] + ":luvers", user)
                    pastDatsJSON[pastDats[i]] = datJSON
                    i ++ 
                }
                await socket.send(await Compress(pastDatsJSON))
            }
            await socket.send(await Compress(typingarray[id]))

            socket.on("message", async (data) => {
                let newText = data.toString().slice(0, 500).replaceAll("<", "&lt;").replaceAll(">", "&gt;").replace(/\n{3,}/g, "\n\n").replace(/([ 　])[ 　]+/g, "$1").replaceAll("\n", "<br>")
                let encoded

                if(data.toString().replace(/\s/g, "") == ""){
                    if(jit) clearTimeout(jit)
                    jit = setTimeout(()=>{
                        delete typingarray[id][user]
                        typinghistory[id][user] = []
                    }, 17500)
                    typingarray[id][user] = ""
                }else{
                    if(jit) clearTimeout(jit)
                    typingarray[id][user] = newText
                }
                if(!typinghistory[id].hasOwnProperty(user)){typinghistory[id][user] = []}
                let diff = Diff.diff(text, newText)
                typinghistory[id][user].push([diff, new Date().getTime()])
                encoded = await Compress([user, diff]);
                for (const client of connectedClients[id]) {
                    if (client.readyState == 1) {
                        client.send(encoded);
                    }else{
                        connectedClients[id] = connectedClients[id].filter(_ => _ !== client);
                    }
                }
                text = newText
            })

            socket.on("close", async () => {
                delete typingarray[id][user]
                delete typinghistory[id][user]
                clearInterval(polling);
                connectedClients[id] = connectedClients[id].filter(_ => _ !== socket);
            })
        }
    }

    const rand64 = (N) => require('crypto').randomBytes(N).toString('base64').replace("/", "l").substring(0, N)

    const iwasreply = async (req, reply) => {
        const { id } = req.params

        if(await redis.exists(req.cookies.secret_key) && await redis.get(req.cookies.secret_key) == req.cookies.username && req.body.trim() && typingarray[id].hasOwnProperty(req.cookies.username)){
            const rk = rand64(8).replaceAll("/", "l").replaceAll("+", "p")

            let hash = JSON.parse(await redis.get(id))
            hash.replys = hash.replys ? parseInt(hash.replys) + 1 : 1
            redis.set(id, JSON.stringify(hash))
            redis.zincrby("ranking", 5.0, id)

            const dats = {
                user: req.cookies.username,
                c: req.body.slice(0, 1024).replaceAll("<", "&lt;").replaceAll(">", "&gt;").replace(/\n{3,}/g, "\n\n").replace(/([ 　])[ 　]+/g, "$1").replaceAll("\n", "<br>"),
                t: new Date().toLocaleString(),
                msgid: rk,
                luv: 0,
                dub: 0,
                replys: 0,
                toreply: id,
                toreplyw: hash.user,
                toreplyb: hash.c.slice(0, 24) + ((hash.c.length >= 24) ? "…" : "")
            }
            if(req.cookies.username!=hash.user){
                redis.incr(hash.user + ":how_notify")
                redis.lpush(hash.user + ":notify", JSON.stringify(["rpl", id, hash.c.slice(0, 24) + ((hash.c.length >= 24) ? "…" : ""), req.cookies.username, rk, dats.c.slice(0, 24) + ((dats.c.length >= 24) ? "…" : "")]))
            }
            redis.set(rk, JSON.stringify(dats))
            redis.set(rk + ':history', await Compress(typinghistory[id][req.cookies.username]))
            redis.lpush(id + ":replys", rk)
            redis.lpush(req.cookies.username + ":msgs", rk)
            redis.lpush("timeline", rk)
            redis.incr(":posts")
            redis.hincrby(":postshis", new Date().toLocaleDateString('sv-SE'), 1)
            let ppp = await redis.get(":all-chars")
            ppp = (parseInt(ppp) && parseInt(ppp) != NaN) ? parseInt(ppp) : 0
            redis.set(":all-chars", ppp + req.body.slice(0, 1024).replace(/\n{3,}/g, "\n\n").replace(/([ 　])[ 　]+/g, "$1").length)
            redis.hset(":all-charshis", new Date().toLocaleDateString('sv-SE'), ppp + req.body.slice(0, 1024).replace(/\n{3,}/g, "\n\n").replace(/([ 　])[ 　]+/g, "$1").length)
            redis.set(req.cookies.username + ":chars", parseInt(await redis.get(req.cookies.username + ":chars")) + req.body.slice(0, 1024).replace(/\n{3,}/g, "\n\n").replace(/([ 　])[ 　]+/g, "$1").length)
            redis.set(req.cookies.username + ":times", parseInt(await redis.get(req.cookies.username + ":times")) + typinghistory[id][req.cookies.username].slice(-1)[0][1] - typinghistory[id][req.cookies.username][0][1])
            let uhjk = req.cookies.username + await redis.get(req.cookies.username + ":handlename") + dats.body.slice(0, 1024)
            if(uhjk.length >= 2){
                for(let i=0; i<uhjk.length-1; i++){
                    redis.sadd(uhjk.slice(i, i+2).toLowerCase(), rk)
                }
            }
            
            delete typingarray[id][req.cookies.username]
            delete typinghistory[id][req.cookies.username]
            dats.posted = 1
            let p = {}
            p[req.cookies.username] = {}
            p[rk] = dats
            const encoded = await Compress(p)
            for (const client of connectedClients[id]) {
                if (client.readyState == 1) {
                    client.send(encoded);
                }else{
                    connectedClients[id] = connectedClients[id].filter(_ => _ !== client);
                }
            }
        }
    }
    
    fastify.register(async fastify => fastify.get('/ws/typing-reply/:user/:key/:id/', { websocket: true }, wewillreply))
    fastify.post('/fetch/post/:id/', iwasreply)

    const timelineffs = async (req, reply) => {
        if("secret_key" in req.cookies && await redis.exists(req.cookies.secret_key) && await redis.get(req.cookies.secret_key) == req.cookies.username){
            const { start, end } = req.params
            if(end - start > 48){
                await reply.code(200).send(await Compress({}))
                return
            }

            let followees = await redis.smembers(req.cookies.username + ":followees")
            if(followees.length == 0) await reply.code(200).send(await Compress({}))
            let pastDatsJSON = {}

            for(username of followees){
                const pastDats = await redis.lrange(username + ":msgs", Math.floor(start/2), Math.floor(start/2+end/3))
                const RTpastDats = pastDats.filter(_ => _.startsWith("re:"))
                const nonRTpastDats = pastDats.filter(_ => !_.startsWith("re:"))
        
                if(pastDats.length >= 1){
                    
                    let i = 0
                    for(pastDat of await redis.mget(nonRTpastDats)){
                        if(pastDat == null){redis.lrem(username + ":msgs", 0, pastDat);continue}
                        let datJSON = JSON.parse(pastDat)
                        datJSON.posted = 1
                        datJSON.msgid = nonRTpastDats[i]
                        datJSON.ruc = await redis.sismember(nonRTpastDats[i] + ":luvers", req.cookies.username)
                        datJSON.dueb = await redis.sismember(nonRTpastDats[i] + ":boosters", req.cookies.username)
                        pastDatsJSON[nonRTpastDats[i]] = datJSON
                        i ++ 
                    }
                    i = 0
                    if(RTpastDats.length > 0){
                        for(rtpastDat of await redis.mget(RTpastDats.map(_ => _.split(":")[1]))){
                            if(rtpastDat == null){redis.lrem(username + ":msgs", 0, RTpastDats[i]);continue}
                            let datJSON = JSON.parse(rtpastDat)
                            datJSON.posted = 1
                            datJSON.msgid = RTpastDats[i]
                            datJSON.whorted = username;
                            datJSON.ruc = await redis.sismember(RTpastDats[i].split(":")[1] + ":luvers", req.cookies.username)
                            datJSON.dueb = await redis.sismember(RTpastDats[i].split(":")[1] + ":boosters", req.cookies.username)
                            pastDatsJSON[RTpastDats[i]] = datJSON
                            i ++ 
                        }
                    }
                }
            }
            await reply.code(200).send(await Compress(pastDatsJSON))
        }
    }
    
    const followers_list = async (req, reply) => {
        if("secret_key" in req.cookies && await redis.exists(req.cookies.secret_key) && await redis.get(req.cookies.secret_key) == req.cookies.username){
            const { target } = req.params
            await reply.code(200).send(await Compress(await redis.smembers(target + ":followers")))
        }
    }
    
    const followees_list = async (req, reply) => {
        if("secret_key" in req.cookies && await redis.exists(req.cookies.secret_key) && await redis.get(req.cookies.secret_key) == req.cookies.username){
            const { target } = req.params
            await reply.code(200).send(await Compress(await redis.smembers(target + ":followees")))
        }
    }

    const kkk = `
		<div class="border-0 border-b-2 bg-slate-50 z-0 hover:bg-slate-100 cursor-pointer transition-all duration-100 ease-[cubic-bezier(.68,-0.6,.32,1.6)] p-6 pr-2 max-sm:px-4 relative border-emerald-500">
            <a class="vvetman flex relative" href="/u/[[username]]" id="u-[[username]]">
                <div class="proflink grow-0 shrink-0 w-16 h-16 mr-4 mt-1 hover:brightness-75 transition duration-50 ease-[cubic-bezier(.68,-0.6,.32,1.6)]" href="" >
                    <img class="w-16 h-16" class="icon" src="/[[username]].webp">
                </div>
                <div>
                    <span class="proflink font-semibold text-lg text-emerald-500 hover:text-emerald-600 transition duration-50 ease-[cubic-bezier(.68,-0.6,.32,1.6)] usernickname">[[handlename]]</span>
                    <span class="text-slate-500 text-sm username"><br>@[[username]]</span>
                    <div class="mt-2">
                        <span class="text-slate-700 bio overflow-wrap w-full">[[bio]]</span>
                    </div>
                </div>
                [[button]]
            </a>
		</div>`

    const followers_list_html = async (req, reply) => {
        if("secret_key" in req.cookies && await redis.exists(req.cookies.secret_key) && await redis.get(req.cookies.secret_key) == req.cookies.username){
            const { target } = req.params
            let un = req.cookies.username
            let hn = await redis.get(un + ":handlename")
            let hnt = await redis.get(target + ":handlename")
            const L = await redis.smembers(target + ":followers")
            let innerhtmlt = ""
            if(L.length != 0){
                const L2 = await redis.mget(L.map(_ => _ + ":handlename"))
                const L3 = await redis.mget(L.map(_ => _ + ":bio"))
                for(i in L){
                    innerhtmlt += kkk.replaceAll("[[username]]", L[i]).replaceAll("[[handlename]]", L2[i]).replaceAll("[[bio]]", L3[i])
                    .replaceAll("[[button]]", (L[i] == un) ? "" : (!await redis.sismember(L[i] + ":followers", un) ? `<button name="${L[i]}" class="follow-up-button" class="absolute right-6 top-2 hover:bg-emerald-600 box-border block text-lg py-0.5 px-4 font-semibold bg-emerald-500 text-white text-center">
                    フォロー
                </button>`: `<button name="${L[i]}" class="follow-up-button absolute right-6 top-2 hover:border-emerald-600 box-border block text-lg py-0.5 px-4 font-semibold border-emerald-500 border-2 text-emerald-500 text-center">
                    リムーブ
                </button>`))
                }
            }
            await reply.type('text/html').code(200).send(ft.replace("[[xssttt]]", innerhtmlt)
            .replaceAll("[[selfusername]]", un)
            .replaceAll("[[selfhandlename]]", hn)
            .replaceAll("[[username]]", target)
            .replaceAll("[[handlename]]", hnt)
            .replaceAll("[[fw]]", "のフォロワーの方々")
            .replaceAll("[[fw2]]", "フォロワー"))
        }else{
            await reply.redirect("/")
        }
    }

    const followees_list_html = async (req, reply) => {
        if("secret_key" in req.cookies && await redis.exists(req.cookies.secret_key) && await redis.get(req.cookies.secret_key) == req.cookies.username){
            const { target } = req.params
            let un = req.cookies.username
            let hn = await redis.get(un + ":handlename")
            let hnt = await redis.get(target + ":handlename")
            const L = await redis.smembers(target + ":followees")
            let innerhtmlt = ""
            if(L.length != 0){
                const L2 = await redis.mget(L.map(_ => _ + ":handlename"))
                const L3 = await redis.mget(L.map(_ => _ + ":bio"))
                for(i in L){
                    innerhtmlt += kkk.replaceAll("[[username]]", L[i]).replaceAll("[[handlename]]", L2[i]).replaceAll("[[bio]]", L3[i])
                    .replaceAll("[[button]]", (L[i] == un) ? "" : (!await redis.sismember(L[i] + ":followers", un) ? `<button name="${L[i]}" class="follow-up-button" class="absolute right-6 top-2 hover:bg-emerald-600 box-border block text-lg py-1 px-4 font-semibold bg-emerald-500 text-white text-center">
                    フォロー
                </button>`: `<button name="${L[i]}" class="follow-up-button absolute right-6 top-2 hover:border-emerald-600 box-border block text-lg py-0.5 px-4 font-semibold border-emerald-500 border-2 text-emerald-500 text-center">
                    リムーブ
                </button>`))
                }
            }
            await reply.type('text/html').code(200).send(ft.replace("[[xssttt]]", innerhtmlt)
            .replaceAll("[[selfusername]]", un)
            .replaceAll("[[selfhandlename]]", hn)
            .replaceAll("[[username]]", target)
            .replaceAll("[[handlename]]", hnt)
            .replaceAll("[[fw]]", "がフォローしている方々")
            .replaceAll("[[fw2]]", "フォロー相手"))
        }else{
            await reply.redirect("/")
        }
    }

    fastify.get('/u/:username/', user)
    fastify.get('/fetch/u/:username/:start/:end/', fetchuser)
    fastify.get('/u/:target/followers/', followers_list_html)
    fastify.get('/u/:target/follows/', followees_list_html)

    fastify.get('/fetch/followers/:target', followers_list)
    fastify.get('/fetch/followees/:target', followees_list)

    fastify.post('/fetch/edit/', edit)

    fastify.get('/fetch/tlf/:start/:end/', timelineffs)

    fastify.get('/p/:id/', postget)
    done()
}