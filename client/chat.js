
// var socket = io.connect('localhost:80');
var socket = io.connect('https://super-garbanzo.herokuapp.com/');

socket.on('msgs', function(data) {
    document.getElementById('boxq').innerHTML += data.text;
});

id = "ANON";

socket.on("id", function(data) {
  id = data.id;
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
  document.getElementById('text-input').value = "";
}

document.addEventListener('keyup', function(e) {
    if(e.keyCode == 13) // enter press
      send_msg();
});
