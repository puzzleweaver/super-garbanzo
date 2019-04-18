// js code for rendering the board (eventually will use webGL, ideally)

var c = document.getElementById('cnvs');
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

function get_x(x, i) {
    return (ps[i].lx - ps[i].x) * ps[i].t / tick + x;
}

function get_y(y, i) {
    return (ps[i].ly - ps[i].y) * ps[i].t / tick + y;
}

function draw() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, c.width, c.height);
    ofx = get_x(ps[id].x, id);
    ofy = get_y(ps[id].y, id);
    for (var i = 0; i < BOARD_WIDTH; i++) {
        for (var j = 0; j < BOARD_HEIGHT; j++) {
            if (board[i][j] == 0)
                ctx.strokeStyle = 'white';
            else if (board[i][j] == -1)
                continue;
            else if(ps[board[i][j]] != undefined)
                ctx.strokeStyle = 'hsl(' + ps[board[i][j]].color*360 + ', 100%, 50%)';
            var ba = boardAssoc[i][j];
            if (ba == undefined || ps[ba] == undefined) {
                ctx.strokeRect(c.width / 2 + (i - ofx) * SIZE + 2,
                    c.height / 2 + (j - ofy) * SIZE + 2, SIZE - 4, SIZE - 4);
            } else {
                ctx.strokeRect(c.width / 2 + (get_x(i, ba) - ofx) * SIZE + 2,
                    c.height / 2 + (get_y(j, ba) - ofy) * SIZE + 2, SIZE - 4, SIZE - 4);
                if (get_x(i, ba) == i && get_y(j, ba) == j)
                    boardAssoc[i][j] = undefined; // reset things that are done moving
            }
        }
    }
    for (var i in ps) {
        ctx.strokeStyle = 'hsl(' + ps[i].color*360 + ', 100%, 50%)';
        ctx.strokeRect(c.width / 2 + (get_x(ps[i].x, i) - ofx) * SIZE + 5,
            c.height / 2 + (get_y(ps[i].y, i) - ofy) * SIZE + 5, SIZE - 10, SIZE - 10);
    }
}

setInterval(update, 1000 / 60);
