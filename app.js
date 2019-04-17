// server vars
var express = require('express');
var socket = require('socket.io');
var app = express();
var serv = require('http').Server(app);
var player = require(__dirname + '/server/player.js');

// set up server
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));
serv.listen(2000);

// socket setup
var io = socket(serv);

var socket_list = {};
var player_list = {};
var board = [], BOARD_WIDTH = 100, BOARD_HEIGHT = 100;
for(var i = 0; i < BOARD_WIDTH; i++) {
    board.push([]);
    for(var j = 0; j < BOARD_HEIGHT; j++) {
        board[i].push(Math.random() < 0.5 ? 0:1);
    }
}

io.on('connection', function(socket) {

    socket_list[socket.id] = socket;
    socket.emit('id', {
        id: socket.id,
    });

    socket.on('start', function(data) {
        player_list[data.id] = new player(data.id,
                Math.floor(Math.random()*BOARD_WIDTH), Math.floor(Math.random()*BOARD_HEIGHT));
        socket.emit('board-init', {
            board: board,
            width: BOARD_WIDTH,
            height: BOARD_HEIGHT,
        });
    });

});

var tick = 150, subtick = 30;
var time = 0;

setInterval(function() {
    time += subtick;
    if(time >= tick) {
        time = 0;
        for(var i in player_list) {
            var player = player_list[i];
            player.x += player.dx;
            player.y += player.dy;
        }
    }

    var px = [], py = [], pid = [];
    for(var i in player_list) {
        px.push(player_list[i].x);
        py.push(player_list[i].y);
        pid.push(player_list[i].id);
    }

    for(var i in socket_list) {
        socket_list[i].emit('player-update', {
            px: px,
            py: py,
            pid: pid,
        });
        socket_list[i].emit('board-update', {
            board: board,
        });
    }

}, 1000/40);
