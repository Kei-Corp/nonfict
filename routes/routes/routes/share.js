module.exports = (fastify, options, done) => {
    let scrollarray = {}
    let connectedClients = {}
    let isoffline = {}
    const { redis } = fastify
    
    const share = async (socket, req) => {
        const { user, key } = req.params
        if(await redis.exists(key) && await redis.get(key) == user){
            isoffline[user] = 0
            if(connectedClients.hasOwnProperty(user)){
                for(client of connectedClients[user]){
                    if (client.readyState == 1) {
                        client.send((await redis.get(user + ":w")).toString())
                    }else{
                        connectedClients[user] = connectedClients[user].filter(_ => _ !== client);
                    }
                }
            }
            socket.on("message", async (data) => {
                if(data.toString().startsWith("[") && JSON.parse(data.toString()).every(l => (parseInt(l) != NaN))){
                    scrollarray[user] = data.toString()
                    if(connectedClients.hasOwnProperty(user)){
                        for(client of connectedClients[user]){
                            if (client.readyState == 1) {
                                client.send(data.toString());
                            }else{
                                connectedClients[user] = connectedClients[user].filter(_ => _ !== client);
                            }
                        }
                    }
                }else{
                    if(data.toString().startsWith("/")){
                        redis.set(user + ":w", data.toString())
                        if(connectedClients.hasOwnProperty(user)){
                            for(client of connectedClients[user]){
                                if (client.readyState == 1) {
                                    client.send(data.toString());
                                }else{
                                    connectedClients[user] = connectedClients[user].filter(_ => _ !== client);
                                }
                            }
                        }
                    }
                }
            })
            socket.on("close", () => {
                isoffline[user] = 1
                delete scrollarray[user]
                if(connectedClients.hasOwnProperty(user)){
                    for(client of connectedClients[user]){
                        if (client.readyState == 1) {
                            client.send("OFFLINE");
                        }else{
                            connectedClients[user] = connectedClients[user].filter(_ => _ !== client);
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
            if(!connectedClients.hasOwnProperty(target)){
                connectedClients[target] = []
            }
            connectedClients[target].push(socket)
            let polling = setTimeout(async ()=>{
                socket.send(scrollarray.hasOwnProperty(target) ? scrollarray[target] : "[1280,720,0]")
                socket.send(await redis.get(target + ":w"))
                if(!isoffline.hasOwnProperty(target) || isoffline[target] == 1){
                    socket.send("OFFLINE")
                }
            }, 50)

            socket.on("close", async () => {
                clearInterval(polling);
                connectedClients[target] = connectedClients[target].filter(_ => _ !== socket);
            })
        }
    }

    fastify.register(async fastify => fastify.get('/ws/screenshare/:user/:key/', { websocket: true }, share))
    fastify.register(async fastify => fastify.get('/ws/screenwatch/:user/:key/:target/', { websocket: true }, watch))
    done()
}