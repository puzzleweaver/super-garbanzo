var socket = io.connect('http://localhost:2000');

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
