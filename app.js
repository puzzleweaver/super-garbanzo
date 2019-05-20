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
var ptr = [];
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
    if(player_list[id] == undefined)
        return;
    setBoard(player_list[id].x, player_list[id].y, -1);
    setBoard(player_list[id].bx, player_list[id].by, -1);
    delete player_list[id];
}

logs = "";

io.on('connection', function(socket) {

    socket_list[socket.id] = socket;
    socket.emit('id', {
        id: socket.id,
        tick: tick,
    });

    socket.on('msg', function(data) {
      message = (data.id+"").substring(0, 4) + ": " + data.text + "<br>";
      logs = message + logs;
      for (var i in socket_list) {
          socket_list[i].emit('msgs', {
              text: message,
          });
        }
    });

    socket.on('start', function(data) {
        socket.emit("msgs", {text:logs});
        if(player_list[data.id] != undefined)
            return;
        var x, y;
        for(var attempt = 0; attempt < 100; attempt++) {
            if(attempt == 99)
                return;
            else {
                x = Math.floor(Math.random() * BOARD_WIDTH);
                y = Math.floor(Math.random() * (BOARD_HEIGHT - 1));
                if(board[x][y] == -1 && board[x][y+1] == -1)
                    break;
            }
        }
        player_list[data.id] = new player(data.id,
        x, y,
        data.color);
        setBoard(x, y, data.id);
        setBoard(x, y+1, data.id);
        socket.emit('board-init', {
            board: board,
            width: BOARD_WIDTH,
            height: BOARD_HEIGHT,
        });
    });
    socket.on('dir-input', function(data) {
        if (player_list[socket.id] == undefined || data.id != socket.id)
            return;
        var p = player_list[socket.id];
        player.time = 0;
        p.dx = data.dx;
        p.dy = data.dy;
    })

    socket.on('disconnect', function(data) {
        if (player_list[socket.id] != undefined)
            ptr.push(socket.id);
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
    loop: for (var i in player_list) {
        var player = player_list[i];
        for (var a = -2; a <= 2; a++) {
            for (var b = -2; b <= 2; b++) {
                var x = (player.x + a + BOARD_WIDTH)%BOARD_WIDTH,
                    y = (player.y + b + BOARD_HEIGHT)%BOARD_HEIGHT;
                if (board[x][y] != 0 && board[x][y] != -1 && board[x][y] != i &&
                        player_list[board[x][y]].bx == x && player_list[board[x][y]].by == y &&
                        player_list[board[x][y]].r >= Math.max(Math.abs(a), Math.abs(b))) {
                    socket_list[i].emit('gameover', {
                        stats: player_list[i].pk,
                    });
                    exit_game(i);
                    player_list[board[x][y]].pk++;
                    continue loop;
                }
            }
        }
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
        // calculate radius
        var d1 = Math.abs(player.x-player.bx), d2 = Math.abs(player.y-player.by);
        if(d1 > BOARD_WIDTH/2) d1 = BOARD_WIDTH-d1;
        if(d2 > BOARD_HEIGHT/2) d2 = BOARD_HEIGHT-d2;
        player.r = Math.min(2, Math.max(d1, d2)-1);
    }

    var ps = {};
    for (var i in player_list) {
        if(player_list[i] == undefined)
            continue;
        ps[i] = {
            x: player_list[i].x,
            y: player_list[i].y,
            lx: player_list[i].lx,
            ly: player_list[i].ly,
            r: player_list[i].r,
            t: player_list[i].time,
            color: player_list[i].color,
            pk: player_list[i].pk,
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
    for(i in ptr) {
        exit_game(i);
    }
    ptr = [];

}, subtick);
