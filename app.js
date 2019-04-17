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
serv.listen(process.env.PORT || 80);

// socket setup
var io = socket(serv);

var socket_list = {};
var player_list = {};
var board = [],
    BOARD_WIDTH = 100,
    BOARD_HEIGHT = 100;
for (var i = 0; i < BOARD_WIDTH; i++) {
    board.push([]);
    for (var j = 0; j < BOARD_HEIGHT; j++) {
        board[i].push(Math.random() < 0.9 ? -1 : 0);
    }
}
boardDeltas = [];

io.on('connection', function(socket) {

    socket_list[socket.id] = socket;
    socket.emit('id', {
        id: socket.id,
        tick: tick,
    });

    socket.on('start', function(data) {
        player_list[data.id] = new player(data.id,
            Math.floor(Math.random() * BOARD_WIDTH), Math.floor(Math.random() * BOARD_HEIGHT));
        board[player_list[data.id].x][player_list[data.id].y] = data.id;
        board[player_list[data.id].x][player_list[data.id].y] = data.id + 1;
        socket.emit('board-init', {
            board: board,
            width: BOARD_WIDTH,
            height: BOARD_HEIGHT,
        });
    });
    socket.on('dir-input', function(data) {
        if (player_list[data.id] == undefined)
            socket.emit('rejected', {});
        var p = player_list[socket.id];
        player.time = 0;
        p.dx = data.dx;
        p.dy = data.dy;
    })

});

var tick = 100,
    subtick = 20;

function setBoard(x, y, to, id) {
    boardDeltas.push({
        x: x,
        y: y,
        to: to,
        id: id,
    });
    board[x][y] = to;
}

function move(x, y, dx, dy, pid) {
    if ((dx == 0 && dy == 0) || x + dx < 0 || x + dx >= BOARD_WIDTH || y + dy < 0 || y + dy >= BOARD_HEIGHT)
        return false;
    var ret = true;
    if(board[x+dx][y+dy] != 0 && board[x+dx][y+dy] != pid && board[x+dx][y+dy] != -1)
        return false;
    if (board[x + dx][y + dy] != -1) {
        ret = move(x + dx, y + dy, dx, dy, pid);
    }
    if(ret) setBoard(x + dx, y + dy, board[x][y], pid);
    return ret;
}

setInterval(function() {
    for (var i in player_list) {
        var player = player_list[i];
        if (player.x + player.dx < 0 || player.x + player.dx >= BOARD_WIDTH)
            player.dx = 0;
        if (player.y + player.dy < 0 || player.y + player.dy >= BOARD_HEIGHT)
            player.dy = 0;
        if (player.time <= 0) {
            if(move(player.x, player.y, player.dx, player.dy, player.id)) {
                setBoard(player.x, player.y, -1, undefined);
                player.lx = player.x;
                player.ly = player.y;
                player.x += player.dx;
                player.y += player.dy;
                player.time = tick-subtick;
            }
        } else
            player.time -= subtick;
    }

    var ps = {};
    for (var i in player_list) {
        ps[i] = {
            x: player_list[i].x,
            y: player_list[i].y,
            lx: player_list[i].lx,
            ly: player_list[i].ly,
            t: player_list[i].time,
        };
    }

    for (var i in socket_list) {
        if (player_list[i] == undefined)
            continue;
        socket_list[i].emit('player-update', {
            ps: ps,
        });
        socket_list[i].emit('board-update', {
            boardDeltas: boardDeltas,
        });
    }
    boardDeltas = [];

}, subtick);
