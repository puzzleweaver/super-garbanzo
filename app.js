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
    BOARD_WIDTH = 20,
    BOARD_HEIGHT = 20;
for (var i = 0; i < BOARD_WIDTH; i++) {
    board.push([]);
    for (var j = 0; j < BOARD_HEIGHT; j++) {
        board[i].push(Math.random() < 0.9 ? -1 : 0);
        if (j == 8)
            board[i][j] = 0;
    }
}
boardDeltas = [];

function exit_game(id) {
    setBoard(player_list[id].x, player_list[id].y, -1);
    setBoard(player_list[id].bx, player_list[id].by, -1);
    delete player_list[id];
}

io.on('connection', function(socket) {

    socket_list[socket.id] = socket;
    socket.emit('id', {
        id: socket.id,
        tick: tick,
    });

    socket.on('start', function(data) {
        player_list[data.id] = new player(data.id,
            Math.floor(Math.random() * BOARD_WIDTH), Math.floor(Math.random() * (BOARD_HEIGHT - 1)),
            data.color);
        setBoard(player_list[data.id].x, player_list[data.id].y, data.id);
        setBoard(player_list[data.id].x, player_list[data.id].y + 1, data.id);
        socket.emit('board-init', {
            board: board,
            width: BOARD_WIDTH,
            height: BOARD_HEIGHT,
        });
    });
    socket.on('dir-input', function(data) {
        if (player_list[data.id] == undefined) {
            socket.emit('rejected', {});
            return;
        }
        var p = player_list[socket.id];
        player.time = 0;
        p.dx = data.dx;
        p.dy = data.dy;
    })

    socket.on('gameover', function(data) {
        exit_game(socket.id);
    });

    socket.on('disconnect', function(data) {
        if (player_list[socket.id] != undefined)
            exit_game(socket.id);
    });

});

var tick = 100,
    subtick = 20;

function setBoardV(x, y, to, id, is_player) {
    boardDeltas.push({
        x: x,
        y: y,
        to: to,
        id: id,
    });
    board[x][y] = to;
    if (!is_player && player_list[to] != undefined) {
        player_list[to].bx = x;
        player_list[to].by = y;
    }
}

function setBoard(x, y, to) {
    setBoardV(x, y, to, undefined, true);
}

// returns false for unable to move, true for able to move, and -1 for loops
function move(x0, y0, x, y, dx, dy, pid) {
    if (dx == 0 && dy == 0)
        return false;
    var ret = true;
    var nx = (x + dx + BOARD_WIDTH) % BOARD_WIDTH,
        ny = (y + dy + BOARD_HEIGHT) % BOARD_HEIGHT;
    if (board[nx][ny] != 0 && board[nx][ny] != pid && board[nx][ny] != -1)
        return false;
    if (nx == x0 && ny == y0)
        return -1;
    if (board[nx][ny] != -1)
        ret = move(x0, y0, nx, ny, dx, dy, pid);
    if (ret != false)
        setBoardV(nx, ny, board[x][y], pid, x0 == x && y0 == y);
    return ret;
}

setInterval(function() {
    for (var i in player_list) {
        var player = player_list[i];
        if (player.time <= 0) {
            var loop_box = board[(player.x - player.dx + BOARD_WIDTH) % BOARD_WIDTH]
                [(player.y - player.dy + BOARD_HEIGHT) % BOARD_HEIGHT];
            var ret = move(player.x, player.y, player.x, player.y,
                player.dx, player.dy, i);
            if (ret != false) {
                if (ret != -1)
                    setBoard(player.x, player.y, -1);
                else
                    setBoardV(player.x, player.y,
                        loop_box, i, false);
                player.x = (player.x + player.dx + BOARD_WIDTH) % BOARD_WIDTH;
                player.y = (player.y + player.dy + BOARD_WIDTH) % BOARD_WIDTH;
                player.lx = player.x - player.dx;
                player.ly = player.y - player.dy;
                player.time = tick - subtick;
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
            color: player_list[i].color,
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
