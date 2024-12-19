const Redis = require("ioredis")

const T = async()=>{
const P = new Redis();
let usrs = await P.lrange("users", 0, 1024)
await P.del("users")
await P.sadd("users", usrs)
}
T();
