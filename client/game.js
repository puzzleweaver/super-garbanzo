var socket = io.connect('http://localhost:2000');
var id;

btn = document.getElementById('btn');
btn.addEventListener('click', function() {
    socket.emit("client-message", {
        message: "hello server.\nfrom, client"
    });
});

socket.on("server-message", function(data) {
    console.log("client received server-message.");
    // ...
});

socket.on("id", function(data) {
    id = data.id;
});

function start() {
    console.log("started.");
    document.getElementById("overlay").style.display = "none";
    socket.emit("start", {
        id: id
    });
}
