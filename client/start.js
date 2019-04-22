// js code for setting up communications with the server and starting the game

// var socket = io.connect('localhost:80');
var socket = io.connect('https://super-garbanzo.herokuapp.com/');
var id, tick;
var began = false;
var inputX = 0,
    inputY = 0;
var board, BOARD_WIDTH, BOARD_HEIGHT;
var boardAssoc;
var ps = undefined;

function color_slider() {
    var root = document.documentElement;
    var slider = document.getElementById("color_slider");
    root.style.setProperty('--hue', slider.value);
    slider.style.transitionDuration = "0.0s";
}

socket.on('id', function(data) {
    id = data.id;
    tick = data.tick;
});

socket.on('rejected', function(data) {
    document.getElementById('overlay-start').style.display = 'block';
    console.log("REJECTED.");
});

function start() {
    document.getElementById('overlay-start').style.display = 'none';
    var slider = document.getElementById("color_slider");
    console.log(slider.value);
    socket.emit('start', {
        id: id,
        color: slider.value,
    });
    began = true;
}
socket.on('board-init', function(data) {
    board = data.board;
    BOARD_WIDTH = data.width;
    BOARD_HEIGHT = data.height;
    init_gfx();
    boardAssoc = [];
    for (var i = 0; i < BOARD_WIDTH; i++) {
        boardAssoc[i] = [];
        for (var j = 0; j < BOARD_HEIGHT; j++) {
            boardAssoc[i][j] = undefined;
        }
    }
});
socket.on('board-update', function(data) {
    for (var i = 0; i < data.boardDeltas.length; i++) {
        var del = data.boardDeltas[i];
        board[del.x][del.y] = del.to;
        boardAssoc[del.x][del.y] = del.id;
    }
});
socket.on('player-update', function(data) {
    ps = data.ps;
});

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
        inputY = 1;
        inputX = 0;
    } else if (e.keyCode == 39 || e.keyCode == 68) {
        // right
        inputX = 1;
        inputY = 0;
    } else if (e.keyCode == 40 || e.keyCode == 83) {
        //down
        inputY = -1;
        inputX = 0;
    }
    if (oiX != inputX || oiY != inputY)
        socket.emit('dir-input', {
            id: id,
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
    else if ((inputY == 1 && (e.keyCode == 38 || e.keyCode == 87)) ||
        (inputY == -1 && (e.keyCode == 40 || e.keyCode == 83)))
        inputY = 0;
    if (oiX != inputX || oiY != inputY)
        socket.emit('dir-input', {
            id: id,
            dx: inputX,
            dy: inputY
        });
});
