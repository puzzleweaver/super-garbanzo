var Player = function(ID, X, Y) {
    var self = {
        id: ID,
        name: "",
        x: X,
        y: Y,
        dx: 0,
        dy: 0,
    }
    return self;
}

module.exports = Player;
