// js code for setting up communications with the server and starting the game

var socket = io.connect('http://localhost:2000');
var id;
var began = false;
var inputX = 0,
    inputY = 0;

btn = document.getElementById('btn');
btn.addEventListener('click', function() {
    socket.emit('client-message', {
        message: 'hello server.\nfrom, client'
    });
});

socket.on('id', function(data) {
    id = data.id;
});

function start() {
    began = true;
    document.getElementById('overlay').style.display = 'none';
    socket.emit('start', {id: id});
}

var board, BOARD_WIDTH, BOARD_HEIGHT;
var px = [], py = [], pid = [];
socket.on('board-init', function(data) {
    board = data.board;
    BOARD_WIDTH = data.width;
    BOARD_HEIGHT = data.height;
});
socket.on('board-update', function(data) {
    board = data.board;
})
socket.on('player-update', function(data) {
    px = data.px;
    py = data.py;
    pid = data.pid;
})

document.addEventListener('keydown', function(e) {
    if (!began)
        return;
    var oiX = inputX,
        oiY = inputY;
    if (e.keyCode == 37 || e.keyCode == 65) {
        // left
        inputX = -1;
        inputY = 0;
    } else if (e.keyCode == 38 || e.keyCode == 87) {
        // up
        inputY = -1;
        inputX = 0;
    } else if (e.keyCode == 39 || e.keyCode == 68) {
        // right
        inputX = 1;
        inputY = 0;
    } else if (e.keyCode == 40 || e.keyCode == 83) {
        //down
        inputY = 1;
        inputX = 0;
    }
    if (oiX != inputX || oiY != inputY)
        socket.emit('dir-input', {
            dx: inputX,
            dy: inputY
        });
});
document.addEventListener('keyup', function(e) {
    if (!began)
        return;
    var oiX = inputX,
        oiY = inputY;
    if ((inputX == -1 && (e.keyCode == 37 || e.keyCode == 65)) ||
        (inputX == 1 && (e.keyCode == 39 || e.keyCode == 68)))
        inputX = 0;
    else if ((inputY == -1 && (e.keyCode == 38 || e.keyCode == 87)) ||
        (inputY == 1 && (e.keyCode == 40 || e.keyCode == 83)))
        inputY = 0;
    if (oiX != inputX || oiY != inputY)
        socket.emit('dir-input', {
            dx: inputX,
            dy: inputY
        });
});
