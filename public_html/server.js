var express = require('express'),
    app     = express(),
    server  = require('http').createServer(app),
    io      = require('socket.io').listen(server),
    mongoose= require('mongoose'),
    users   = {};

server.listen(3000);

//connectio to mongodb
var mongoURI  =   "mongodb://localhost:27017/chatApp";
var mongodb     =   mongoose.connect(mongoURI).connection;
mongodb.on('error', function(err){
   console.log('Erorr mongodb : '+ err.message); 
});
mongodb.on('open', function(){
   console.log('Now connection to mongodb'); 
});
//create schema
var chatAppSchema = mongoose.Schema({
   user:String,
   text:String,
   created:{type:Date, default:Date.now}
});
var chatMessage = mongoose.model('message', chatAppSchema);

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
        }else{
             callback(true);
            socket.user = data;
            io.sockets.emit('new user', socket.user); 
            users[socket.user] = socket;
            allUsers();
        }
    });
    
    socket.on('send message', function(smg)
    {
        var newSmg = new chatMessage({user:socket.user, text:smg});
        newSmg.save(function(err){
            if(err) throw err;            
           io.sockets.emit('new message' ,{text:smg, user:socket.user});
        });
        
    });
    
    var query = chatMessage.find({});
    query.sort('-created').limit().exec(function(err,docs){
        if(err){
            console.log('error when load form database : '+ err.message);           
        }
        else{
            socket.emit('old message', docs); 
        }
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
        io.sockets.emit('user disconnet', socket.user);
    });
    
});
