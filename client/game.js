// js code for rendering the board (eventually will use webGL, ideally)

var c = document.getElementById('c2d');
c.width = window.innerWidth;
c.height = window.innerHeight;
var ctx = c.getContext('2d');
ctx.strokeStyle = '#ff0000';
ctx.moveTo(0, 0);
ctx.lineTo(c.width, c.height);
ctx.stroke();

var SIZE = Math.min(c.width, c.height) / 20;

function update() {
    draw();
}

var ofx = 0,
    ofy = 0;

function draw() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, c.width, c.height);
    for (var i = 0; i < BOARD_WIDTH; i++) {
        for (var j = 0; j < BOARD_HEIGHT; j++) {
            if (board[i][j] == 1) {
                ctx.strokeStyle = 'white';
                ctx.strokeRect(c.width / 2 + (i - ofx) * SIZE + 2, c.height / 2 + (j - ofy) * SIZE + 2, SIZE - 4, SIZE - 4);
            }
        }
    }
    for (var i = 0; i < pid.length; i++) {
        if (pid[i] == id) {
            ofx = 0.5 * (ofx + px[i]);
            ofy = 0.5 * (ofy + py[i]);
        }
        ctx.strokeStyle = 'green';
        ctx.strokeRect(c.width / 2 + (px[i] - ofx) * SIZE + 2, c.height / 2 + (py[i] - ofy) * SIZE + 2, SIZE - 4, SIZE - 4);
    }
}

setInterval(update, 1000 / 60);
