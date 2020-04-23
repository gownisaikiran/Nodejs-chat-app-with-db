// Make connection
var socket = io.connect('http://localhost:4000');

// if(!localStorage.name)
// {
    var name = prompt("Please enter your name ?");
    document.getElementById('handle').value =  name;
    localStorage.setItem("name", name);
// }

// Query DOM
var message = document.getElementById('message'),
      handle = document.getElementById('handle'),
      btn = document.getElementById('send'),
      output = document.getElementById('output'),
      onlineUsers = document.getElementById('online-users'),
      feedback = document.getElementById('feedback');
 

     
document.title = document.title + "-"+handle.value+"";
output.innerHTML += '<p style="text-align: center;"><strong>You Joined the Chat</strong></p>';
// New User connected
socket.emit('new-user', {
    name : name
});


// Emit events
btn.addEventListener('click', function(){
    var today = new Date();
    var time = today.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
    socket.emit('chat', {
        message: message.value,
        handle: handle.value,
        time: time
    });
    message.value = "";
});

message.addEventListener('keypress', function(){
    socket.emit('typing', handle.value);
});

// Listen for events
socket.on('chat', function(data){
    feedback.innerHTML = '';
    console.log(data.handle,handle.value);
    // var today = new Date();
    // // var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    // var time = today.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
    if(data.handle == handle.value)
    {
      output.innerHTML += '<div id="msg" style="margin-left: 60%;"><div style="font-size: 18px;font-family:sans-serif;padding: 5px 0px;">'+data.message+'</div><div id="chat-time">'+data.time+'</div></div><br>';
    }
    else
    {
      output.innerHTML += '<div id="msg"><strong>'+data.handle+': </strong><br><div style="font-size: 18px;font-family:sans-serif;padding: 5px 0px;">'+data.message+'</div><div id="chat-time">'+data.time+'</div></div><br>';
    }
    
});

// Typing Listener
socket.on('typing', function(data){
    feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
});

// New user Listener
socket.on('new-user', function(data){
    // console.log(data);
    output.innerHTML += '<p style="text-align: center;"><strong>'+data.name+' Joined the Chat</strong></p>';
    
});

// Online users Listener
socket.on('online-users', function(data){
    //console.log(data);
    var obj = data;
    var values = Object.keys(obj).map(function (key) { return obj[key]; });
    //console.log(values);
    onlineUsers.innerHTML = "";
    for (index = 0; index < values.length; index++) {
        onlineUsers.innerHTML += '<span class="dot"></span><b>'+values[index].name+'</b><br>';
    }
    
});

// User disconnected Listener
socket.on('user-disconnected', function(data){
    console.log(data);
    output.innerHTML += '<p style="text-align: center;"><strong>'+data.name+' left the Chat</strong></p>';
});


$(document).ready(function(){
    $.ajax({url: "./api/messages", 
    success: function(result)
    {
        console.log(result.length);
        console.log(result[0].time);
        for (index = 0; index < result.length; index++) {
            if(result[index].name == handle.value)
            {
                output.innerHTML += '<div id="msg" style="margin-left: 60%;"><div style="font-size: 18px;font-family:sans-serif;padding: 5px 0px;">'+result[index].message+'</div><div id="chat-time">'+result[index].time+'</div></div><br>'; 
            }
            else{
                output.innerHTML += '<div id="msg"><strong>'+result[index].name+': </strong><br><div style="font-size: 18px;font-family:sans-serif;padding: 5px 0px;">'+result[index].message+'</div><div id="chat-time">'+result[index].time+'</div></div><br>';   
            }
        }
    }
    });
});