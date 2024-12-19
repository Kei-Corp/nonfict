const path = require('path')
const fs = require('fs')
const security = require('./security')

const index = fs.readFileSync(path.join(__dirname, '../html/index.html')).toString()
const account = fs.readFileSync(path.join(__dirname, '../html/account.html')).toString()
const tos = fs.readFileSync(path.join(__dirname, '../html/tos.html')).toString()
const cg = fs.readFileSync(path.join(__dirname, '../html/cg.html')).toString()
const contact = fs.readFileSync(path.join(__dirname, '../html/contact.html')).toString()
const analytics = fs.readFileSync(path.join(__dirname, '../html/analytics.html')).toString()

const choice = (p) => {
    return p[Math.floor(Math.random() * p.length)]
}

module.exports = (fastify, options, done) => {
    const { redis } = fastify

    fastify.get('/', async (req, reply) => {
        if("secret_key" in req.cookies && await redis.exists(req.cookies.secret_key) && await redis.get(req.cookies.secret_key) == req.cookies.username){
            let un = req.cookies.username
            let hn = await redis.get(un + ":handlename")

            let html = index
                        .replaceAll("[[selfusername]]", un)
                        .replaceAll("[[selfhandlename]]", hn)
                        .replaceAll("[[randomtext]]", choice(["なんか言ってよ！", "とっとと吐いて楽になれ", "洗いざらい吐け", "黙ってないで何とか言えよ！"]))

            reply.type('text/html').code(200).send(html)
        }else{
            reply.type('text/html').code(200).send(account)
        }
        return 
    })
    fastify.get('/tos/', (req, reply) => {
        reply.type('text/html').code(200).send(tos)
    })
    fastify.get('/guideline/', (req, reply) => {
        reply.type('text/html').code(200).send(cg)
    })
    fastify.get('/contact/', (req, reply) => {
        reply.type('text/html').code(200).send(contact)
    })
    fastify.get('/analytics/', (req, reply) => {
        reply.type('text/html').code(200).send(analytics)
    })
    done()
}