var http = require('http')
var fs = require('fs')
var path = require('path')

const APP_PORT = process.env.APP_PORT || 3000

const app = http.createServer(requestHandler)
app.listen(APP_PORT)
console.log(`🖥 HTTP Server running at ${APP_PORT}`)

// handles all http requests to the server
function requestHandler(request, response) {
  console.log(`🖥 Received request for ${request.url}`)

  // append /client to serve pages from that folder
  var filePath = './client' + request.url

  if (filePath == './client/') {
    // serve index page on request /
    filePath = './client/index.html'
  }

  var extname = String(path.extname(filePath)).toLowerCase()
  console.log(`🖥 Serving ${filePath}`)
  var mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
  }

  var contentType = mimeTypes[extname] || 'application/octet-stream'

  fs.readFile(filePath, function (error, content) {
    if (error) {
      if (error.code == 'ENOENT') {
        fs.readFile('./client/404.html', function (error, content) {
          response.writeHead(404, { 'Content-Type': contentType })
          response.end(content, 'utf-8')
        })
      } else {
        response.writeHead(500)
        response.end('Sorry, there was an error: ' + error.code + ' ..\n')
      }
    } else {
      response.writeHead(200, { 'Content-Type': contentType })
      response.end(content, 'utf-8')
    }
  })
}

// we'll store the users in this object as socketId: username
const users = {}

var io = require('socket.io')(app)
// starts socket
io.on('connection', function (socket) {
  console.log('👾 Started socket.io. Waiting for clients...')
  // Manage all socket.io events next...
  socket.on('new-connection', (data) => {
    console.log(`👾 new-connection event ${data.username}`)
    // saves user to list
    users[socket.id] = data.username
    socket.emit('welcome', {
      user: 'server',
      message: `Welcome to this Socket.io chat ${data.username}. There are ${
        Object.keys(users).length
      } users`,
    })
    socket.broadcast.emit('broadcast-message', {
      user: 'server',
      message: `🗣${data.username} has joined the chat`,
    })
  })
  socket.on('new-message', (data) => {
    console.log(`👾 new-message from ${data.user}`)
    // broadcast message to all sockets except the one that triggered the event
    socket.broadcast.emit('broadcast-message', {
      user: users[data.user],
      message: data.message,
    })
  })
})
