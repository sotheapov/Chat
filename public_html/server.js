var express = require('express'),
    app     = express(),
    server  = require('http').createServer(app),
    io      = require('socket.io').listen(server);

server.listen(3000);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
  console.log('Now server is running');
});

//connect to server
io.sockets.on('connection', function(socket){
    //get data from server by name 
    
    //get user join
    socket.on('user join',function(data){
       io.sockets.emit('new user', socket.user = data); 
    });
    
    socket.on('send message', function(smg)
    {
        io.sockets.emit('new message' ,{smg:smg, user:socket.user});
    });
    
    
});
