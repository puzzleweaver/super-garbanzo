// server vars
var express = require('express');
var socket = require('socket.io');
var app = express();
var serv = require('http').Server(app);

// set up server
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));
serv.listen(2000);

// socket setup
var io = socket(serv);

io.on('connection', function(socket) {

    socket.on('client-message', function(data) {
        console.log("server received client-message");
        socket.emit("server-message", {message: "hi client,\nfrom server <3"});
        // ...
    });

});
