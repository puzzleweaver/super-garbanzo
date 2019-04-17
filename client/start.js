// js code for setting up communications with the server and starting the game

var socket = io.connect('http://localhost:2000');
var id;

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
    console.log('started.');
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
    players = data.player_list;
})
