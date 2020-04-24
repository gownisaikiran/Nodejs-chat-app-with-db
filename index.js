var express = require('express');
var socket = require('socket.io');
// var mysql = require('mysql');
var port = process.env.PORT;
// App setup
var app = express();
var server = app.listen(port, function(){
    console.log('listening for requests on port '+server.address().port);
});

// Static files (Middleware method : app.use)
app.use(express.static('public'));

// Socket setup & pass server
var io = socket(server);

app.use(express.json());

// DataBase Connection
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database : "chat_db"
  });
  
con.connect(function(err) {
if (err) throw err;
console.log("Mysql Database Connected!");
});

// API for getting Chat Messages
app.get('/api/messages',(req,res)=>{
    // const messages = [];
    var sql = "SELECT * FROM messages;";
        con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.send(result);
        });  
        
})


const users = {};
io.on('connection', (socket) => {

    
    console.log('made socket connection ', socket.id);
    // Handle new user event
    socket.on('new-user', (data) => {
        users[socket.id]= data;
        console.log(data.name+" joined chat");
        socket.broadcast.emit('new-user', data);
        io.sockets.emit('online-users', users);
    });

    // Handle left user event
    socket.on('disconnect', () => {
        //console.log(Object.keys(users).length)
        //if(true){
        //console.log(users[socket.id].name+" left chat");
        socket.broadcast.emit('user-disconnected',users[socket.id]);
        delete users[socket.id];
        io.sockets.emit('online-users', users);
        //}
    });

    // Handle chat event
    socket.on('chat', (data) => {
        console.log(data);
        var sql = "INSERT INTO messages VALUES ('','msg','"+data.handle+"','"+data.message+"','"+data.time+"')";
        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");
          });
        io.sockets.emit('chat', data);
    });

    // Handle typing event
    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data);
    });

});
