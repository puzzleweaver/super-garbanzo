var Player = function(ID, X, Y, COLOR) {
    var self = {
        id: ID,
        x: X,
        y: Y,
        dx: 0,
        dy: 0,
        lx: X,
        ly: Y,
        bx: X,
        by: Y+1,
        r: 0,
        color: COLOR,
        time: 0,
        pk: 0,
    }
    return self;
}

module.exports = Player;
