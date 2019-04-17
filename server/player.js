var Player = function(ID, X, Y, COLOR) {
    var self = {
        id: ID,
        name: "",
        x: X,
        y: Y,
        dx: 0,
        dy: 0,
        lx: X,
        ly: Y,
        color: COLOR,
        time: 0,
    }
    return self;
}

module.exports = Player;
