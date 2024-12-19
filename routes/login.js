module.exports = (fastify, options, done) => {
    const rand64 = (N) => require('crypto').randomBytes(N).toString('base64').replace("/", "l").substring(0, N)

    const yoyakugo = ["users", "typing", "timeline"]

    const { redis } = fastify

    const fs = require('node:fs')
    const path = require('path')


function generateCombinations(str) {
  const combinations = [];
  const n = str.length;

  // 総当たりで2^n通りの組み合わせを生成
  for (let i = 0; i < (1 << n); i++) {
    let combination = "";
    for (let j = 0; j < n; j++) {
      if (i & (1 << j)) {
        combination += str[j].toUpperCase();
      } else {
        combination += str[j].toLowerCase();
      }
    }
    combinations.push(combination);
  }

  return combinations;
}

    const createAccount = async (req, reply) => {
        const un = req.body.username.replace(' ', '').replace("<", "&lt;").replace(">", "&gt;")
        const hn = req.body.handlename.replace("<", "&lt;").replace(">", "&gt;")
        const pw = req.body.password

        if (await redis.exists(req.ip)) {
            reply.type('text/plain').code(500).send("同一IPでの複数アカウント所持は禁止されています。")
            return
        }
        if (!un.match(/^[a-zA-Z0-9_]+$/) || un.length >= 12 || un.length < 3) {
            reply.type('text/plain').code(500).send("不正なユーザー名です。")
            return
        }
        let P = generateCombinations(un)
        let P2 = await redis.mget(P.map(_ => _+":password"))
        if (P2.some(_=>_!=null)){
            reply.type('text/plain').code(500).send("同名のアカウントがすでに存在します。")
            return
        }
        if (await redis.exists(un + ":password")) {
            reply.type('text/plain').code(500).send("同名のアカウントがすでに存在します。")
            return
        }
        if (hn.length >= 32 || hn.length == 0 || yoyakugo.some(s => s == un)) {
            reply.type('text/plain').code(500).send("不正なリクエストです。")
            return
        }
        
        let rk = rand64(8)

        //await redis.lrem("users", 0, un)
        await redis.sadd("users", un)
        await redis.hset(":howmuchusers-his", new Date().toLocaleDateString('sv-SE'), await redis.scard("users"))
        redis.set(req.ip, un)
        await redis.set(un + ":password", pw)
        await redis.set(un + ":handlename", hn.replace("<", "&lt;").replace(">", "&gt;"))
        redis.set(un + ":bio", "")
        redis.set(un + ":chars", 0)
        redis.set(un + ":makedday", 0)
        redis.set(un + ":times", 0)
        redis.set(un + ":how_notify", 0)

        fs.copyFileSync(path.join(__dirname, '../static/') + ".simplifyedicon.webp", path.join(__dirname, '../static/') + un + ".webp")

        await redis.set(rk, un)
        await reply.cookie('secret_key', rk, {maxAge: 3600*24*30, path: "/", domain:"nonfict.me"})
                .cookie('username', un, {maxAge: 3600*24*30, path: "/", domain: "nonfict.me"})
                .type('text/plain').code(200)
                .send("アカウントの作成に成功しました！")

        return
    }
    
    const login = async (req, reply) => {
        let un = req.body.username.replace(' ', '')
        const pw = req.body.password

        if(un.length >= 16){
            reply.type('text/plain').code(404).send("ユーザー名またはパスワードが一致しません。")
        }
        if(!await redis.exists(un + ":password")){
            let P = generateCombinations(un)
            let P2 = await redis.mget(P.map(_ => _+":password"))
            un = P.filter((_, i) => P2[i] == pw)
        }
        if(!await redis.exists(un + ":password") || await redis.get(un + ":password") != pw){
            reply.type('text/plain').code(404).send("ユーザー名またはパスワードが一致しません。")
        }

        let rk = rand64(8)

        await redis.set(rk, un)
        await redis.expire(rk, 3600*24*7)

        await reply.cookie('secret_key', rk, {maxAge: 3600*24*30, path: "/", domain: "nonfict.me"})
                .cookie('username', un, {maxAge: 3600*24*30, path: "/", domain: "nonfict.me"})
                .type('text/plain').code(200)
                .send("ログインに成功しました！")

        return
    }

    const logout = async (req, reply) => {
        if(req.cookies.secret_key){
            await redis.del(req.cookies.secret_key)
        }
        await reply.clearCookie('secret_key', {path: "/", domain: "nonfict.me"})
                .clearCookie('username', {path: "/", domain: "nonfict.me"})
                .redirect('/')
        return
    }

    fastify.post('/fetch/create-account/', createAccount)
    fastify.post('/fetch/login/', login)
    fastify.get('/logout/', logout)
    done()
}
