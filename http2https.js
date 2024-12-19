const http = require('http');
const server = http.createServer((req, res) => {res.writeHead(301, {Location: `https://${req.headers.host}${req.url}`}); res.end(); })
server.listen(80)

