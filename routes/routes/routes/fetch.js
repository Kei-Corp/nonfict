const Compress = require("./compress")

const path = require('path')
const fs = require('fs')
const html = fs.readFileSync(path.join(__dirname, '../html/notify.html')).toString()

module.exports = (fastify, options, done) => {
    const { redis } = fastify

    const fetchHandleName = async (req, reply) => {
        const { username } = req.params
        
        await reply.code(200)
                .send(await redis.get(username + ":handlename"))
    }

    const followUser = async (req, reply) => {
        const { target } = req.params
        const { username } = req.cookies

        if("secret_key" in req.cookies && await redis.exists(req.cookies.secret_key) && await redis.get(req.cookies.secret_key) == req.cookies.username && target !== username){
            if(await redis.sismember(target + ":followers", username)){
                redis.srem(target + ":followers", username)
                redis.srem(username + ":followees", target)
                await reply.code(200).send("-1")
            }else{
                redis.incr(target + ":how_notify")
                redis.lpush(target + ":notify", JSON.stringify(["follow", username]))
                redis.sadd(target + ":followers", username)
                redis.sadd(username + ":followees", target)
                await reply.code(200).send("1")
            }
        }
    }

    const addBoost = async (req, reply) => {
        let { id } = req.params
        if(id.startsWith("re:")){
            id = id.split(":")[1]
        }

        if("secret_key" in req.cookies && await redis.exists(req.cookies.secret_key) && await redis.get(req.cookies.secret_key) == req.cookies.username && await redis.exists(id)){
            const { username } = req.cookies
            let hash = JSON.parse(await redis.get(id))
            let luv


            if(await redis.sismember(id + ":boosters", username)){
                await reply.code(200).send("-1")
                redis.srem(id + ":boosters", username)
                redis.lrem(req.cookies.username + ":msgs", 0, "re:" + id)
                redis.lrem("timeline", 0, "re:" + id + ":" + username)
                //if(await redis.hexists(id, "luv")) await redis.hset(id, "luv", luv - 1)
            }else{
                await reply.code(200).send("1")
                if(req.cookies.username!=hash.user){
                    redis.incr(hash.user + ":how_notify")
                    redis.lpush(hash.user + ":notify", JSON.stringify(["re", id, hash.c.slice(0, 24) + ((hash.c.length >= 24) ? "…" : ""), req.cookies.username]))
                }
                redis.sadd(id + ":boosters", username)
                redis.lpush(req.cookies.username + ":msgs", "re:" + id)
                redis.lpush("timeline", "re:" + id + ":" + username)
                //if(await redis.hexists(id, "luv")) luv = await redis.hincrby(id, "luv", 1)
            }
            hash.dub = await redis.scard(id + ":boosters")
            if(hash.dub == 0) hash.dub = null
            redis.set(id, JSON.stringify(hash))
            return
        }
        await reply.code(500).send("go f urself")
    }

    const how_notify = async (req, reply) => {
        await reply.send(await redis.get(req.cookies.username + ":how_notify"))
    }

    const notify = async (req, reply) => {
        if("secret_key" in req.cookies && await redis.exists(req.cookies.secret_key) && await redis.get(req.cookies.secret_key) == req.cookies.username){
            await reply.send(await redis.lrange(req.cookies.username + ":notify", 0, 64))
        }
    }

    const notifypage = async (req, reply) => {
        if("secret_key" in req.cookies && await redis.exists(req.cookies.secret_key) && await redis.get(req.cookies.secret_key) == req.cookies.username){
            let un = req.cookies.username
            let hn = await redis.get(un + ":handlename")
            let notifyis = ""
            await redis.set(req.cookies.username + ":how_notify", 0)
            if(await redis.llen(req.cookies.username + ":notify") >= 1){
                for(t of await redis.lrange(req.cookies.username + ":notify", 0, 64)){
                    let yghui = JSON.parse(t)
                    if(yghui[0] == "rpl"){
                        notifyis += `
                    <span class="boosterlink text-emerald-500 border-b-2 border-emerald-500 py-2 grow-0 shrink-0 text-sm block mb-2" href="" >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 scale-75">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m11.99 16.5-3.75 3.75m0 0L4.49 16.5m3.75 3.75V3.75h11.25" />
                        </svg>
                        <a href="/u/${yghui[3]}" class="font-medium ygrehj hover:brightness-75 hover:underline transition duration-50 ease-[cubic-bezier(.68,-0.6,.32,1.6)]">${await redis.get(yghui[3] + ":handlename")}</a>
                        <span class="text-slate-500">によるあなたの投稿「<a href="/p/${yghui[1]}" class="font-medium text-slate-800 hover:brightness-75 hover:underline transition duration-50 ease-[cubic-bezier(.68,-0.6,.32,1.6)]">${yghui[2].replaceAll("<", "").replaceAll(">", "")}</a>」
                        へのバギング「<a href="/p/${yghui[4]}" class="font-medium text-slate-800 hover:brightness-75 hover:underline transition duration-50 ease-[cubic-bezier(.68,-0.6,.32,1.6)]">${yghui[5].replaceAll("<", "").replaceAll(">", "")}</a>」</span>
                    </span>`
                    }else if(yghui[0] == "re"){
                        notifyis += `
                    <span class="boosterlink text-violet-500 border-b-2 border-emerald-500 py-2 grow-0 shrink-0 text-sm block mb-2" href="" >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 scale-75">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
                        </svg> 
                        <a href="/u/${yghui[3]}" class="font-medium ygrehj hover:brightness-75 hover:underline transition duration-50 ease-[cubic-bezier(.68,-0.6,.32,1.6)]">${await redis.get(yghui[3] + ":handlename")}</a>
                        <span class="text-slate-500">によるあなたの投稿「<a href="/p/${yghui[1]}" class="font-medium text-slate-800 hover:brightness-75 hover:underline transition duration-50 ease-[cubic-bezier(.68,-0.6,.32,1.6)]">${yghui[2].replaceAll("<", "").replaceAll(">", "")}</a>」
                        へのダビング</span>
                    </span>`
                    }else if(yghui[0] == "luv"){
                        notifyis += `
                    <span class="boosterlink text-rose-500 border-b-2 border-emerald-500 py-2 grow-0 shrink-0 text-sm block mb-2" href="" >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 scale-75">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                        </svg>
                        <a href="/u/${yghui[3]}" class="font-medium ygrehj hover:brightness-75 hover:underline transition duration-50 ease-[cubic-bezier(.68,-0.6,.32,1.6)]">${await redis.get(yghui[3] + ":handlename")}</a>
                        <span class="text-slate-500">によるあなたの投稿「<a href="/p/${yghui[1]}" class="font-medium text-slate-800 hover:brightness-75 hover:underline transition duration-50 ease-[cubic-bezier(.68,-0.6,.32,1.6)]">${yghui[2].replaceAll("<", "").replaceAll(">", "")}</a>」
                        へのラビング</span>
                    </span>`
                    }else if(yghui[0] == "follow"){
                        notifyis += `
                    <span class="boosterlink text-emerald-500 border-b-2 border-emerald-500 py-2 grow-0 shrink-0 text-sm block mb-2" href="" >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 scale-75">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                        </svg>
                        <a href="/u/${yghui[1]}" class="font-medium ygrehj hover:brightness-75 hover:underline transition duration-50 ease-[cubic-bezier(.68,-0.6,.32,1.6)]">${await redis.get(yghui[1] + ":handlename")}</a>
                        <span class="text-slate-500">があなたをフォローしたそうです</span>
                    </span>`
                    }
                }
            }
            await reply.type('text/html').code(200).send(html
                .replaceAll("[[selfusername]]", un)
                .replaceAll("[[selfhandlename]]", hn)
                .replaceAll("[[notifications]]", notifyis))
        }else{
            await reply.redirect("/")
        }
    }

    const loversList = async (req, reply) => {
        const { id } = req.params
        await reply.code(200).send(JSON.stringify(await redis.lrange(id + ":luvers")))
        return
    }

    fastify.post('/fetch/boost/:id/', addBoost)
    fastify.post('/fetch/hn/:username/', fetchHandleName)
    fastify.post('/fetch/follow/:target/', followUser)
    fastify.post('/fetch/luvers/:id/', loversList)

    fastify.get('/fetch/notify/', notify)
    fastify.get('/fetch/how_notify/', how_notify)
    fastify.get('/n/', notifypage)
    done()
}
