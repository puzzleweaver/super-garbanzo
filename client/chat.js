
// var socket = io.connect('localhost:80');
var socket = io.connect('https://super-garbanzo.herokuapp.com/');

socket.on('msgs', function(data) {
    document.getElementById('box').innerHTML += data.id + ": " + data.text + "<br><br>";
});

function start() {
    socket.emit('start', {
        id: id,
    });
}

function send_msg() {
  socket.emit("msg", {
    id:id,
    text:document.getElementById('text-input').value,
  });
}

document.addEventListener('keyup', function(e) {
    if(e.keyCode == 13) // enter press
      send_msg();
});
