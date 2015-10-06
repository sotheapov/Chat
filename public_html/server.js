var express = require('express'),
    app     = express(),
    server  = require('http').createServer(app),
    io      = require('socket.io').listen(server),
    users   = {};

server.listen(3000);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
  console.log('Now server is running');
});

//connect to server
io.sockets.on('connection', function(socket){
    //get data from server by name 
    
    //get user join
    socket.on('user join',function(data, callback){ 
        //if user exist
        if(data in users){
            callback(false);
        }else
        {
             callback(true);
            socket.user = data;
            io.sockets.emit('new user', socket.user); 
            users[socket.user] = socket;
            allUsers();
        }
    });
    
    socket.on('send message', function(smg)
    {
        io.sockets.emit('new message' ,{smg:smg, user:socket.user});
    });
    function allUsers()
    {
        io.sockets.emit('all user', Object.keys(users));
    }
    
    // User diconnect
    socket.on('disconnect', function(data){
        if(!socket.user)return;
        delete users[socket.user];
        allUsers();
    });
    
});
