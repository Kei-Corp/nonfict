const fs = require('fs')

const certPath = '/etc/letsencrypt/live/nonfict.me';

const fastify = require('fastify')({
    ignoreTrailingSlash: true,
    ignoreDuplicateSlashes: true,
    http2: true,
    https: {
        allowHTTP1: true,
        key: fs.readFileSync(`${certPath}/privkey.pem`),
        cert: fs.readFileSync(`${certPath}/fullchain.pem`)
    },
})
const path = require('path')

fastify.register(require('@fastify/helmet'), { global: true, contentSecurityPolicy: {directives: {"default-src": ["'self'"], "script-src": ["'self'", "'unsafe-inline'", "unpkg.com", "tailwindcss.com", "cdn.tailwindcss.com", "cdnjs.cloudflare.com", "api.pwnedpasswords.com", "www.google-analytics.com", "www.googletagmanager.com", "analytics.google.com", "pwnedpasswords.com"], "connect-src": ["api.pwnedpasswords.com", "www.google-analytics.com", "pwnedpasswords.com", "'self'"], "script-src-attr": ["'unsafe-inline'"]}} })
fastify.register(require('@fastify/redis'), { host: '127.0.0.1' })
fastify.register(require('@fastify/cookie'))
fastify.register(require('@fastify/multipart'), { limits: { fileSize: 100000000 } })
fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, 'static'),
    prefix: '/',
    cacheControl: true,
    setHeaders(res) {
        res.setHeader('cache-control', 'public, max-age=3600, immutable');
    },
})
fastify.register(require('@fastify/websocket'), {server: fastify.server})

fastify.register(require('./routes/index'))
fastify.register(require('./routes/login'))
fastify.register(require('./routes/timeline'))
fastify.register(require('./routes/fetch'))
fastify.register(require('./routes/profile'))
fastify.register(require('./routes/search'))
fastify.register(require('./routes/stats'))

fastify.setNotFoundHandler((req, reply) => {
    reply.code(404).type('text/html').send('Not Found')
})

fastify.listen({host: '0.0.0.0', port: 443})
