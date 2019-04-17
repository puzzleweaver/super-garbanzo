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
    if (!began)
        return;
    draw();
}

var ofx = 0,
    ofy = 0;

function get_x(x, i) {
    return (plx[i] - px[i]) * pt[i] / 150 + x;
}

function get_y(y, i) {
    return (ply[i] - py[i]) * pt[i] / 150 + y;
}

function draw() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, c.width, c.height);
    for (var i = 0; i < BOARD_WIDTH; i++) {
        for (var j = 0; j < BOARD_HEIGHT; j++) {
            if (board[i][j] == 1) {
                ctx.strokeStyle = 'white';
                var ba = boardAssoc[i * BOARD_WIDTH + j];
                if (ba == undefined) {
                    ctx.strokeRect(c.width / 2 + (i - ofx) * SIZE + 2,
                            c.height / 2 + (j - ofy) * SIZE + 2, SIZE - 4, SIZE - 4);
                }else {
                    console.log("happened!");
                    ctx.strokeRect(c.width / 2 + (get_x(i, ba) - ofx) * SIZE + 2,
                            c.height / 2 + (get_y(j, ba) - ofy) * SIZE + 2, SIZE - 4, SIZE - 4);
                    // if(get_x(i, ba) == i && get_y(j, ba) == j)
                    //     boardAssoc[i * BOARD_WIDTH + j] = undefined;
                }
            }
        }
    }
    for (var i = 0; i < pid.length; i++) {
        if (pid[i] == id) {
            ofx = get_x(px[i], i);
            ofy = get_y(py[i], i);
        }
        ctx.strokeStyle = 'green';
        ctx.strokeRect(c.width / 2 + (get_x(px[i], i) - ofx) * SIZE + 2, c.height / 2 + (get_y(py[i], i) - ofy) * SIZE + 2, SIZE - 4, SIZE - 4);
    }
}

setInterval(update, 1000 / 60);
