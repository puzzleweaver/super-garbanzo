
// var socket = io.connect('localhost:80');
var socket = io.connect('https://super-garbanzo.herokuapp.com/');

socket.on('msgs', function(data) {
    document.getElementById('boxq').innerHTML = data.text + document.getElementById('boxq').innerHTML;
});

socket.on('msgsr', function(data) {
    document.getElementById('boxq').innerHTML = data.text;
});

id = "ANON";

socket.on("id", function(data) {
  id = data.id;
  socket.emit('start', {
      id: id,
  });
});

function reset() {
  socket.emit("reset", {});
}

function send_msg() {
  socket.emit("msg", {
    id:id,
    text:document.getElementById('text-input').value,
    name:document.getElementById('name-input').value,
  });
  document.getElementById('text-input').value = "";
}

document.addEventListener('keyup', function(e) {
    if(e.keyCode == 13) // enter press
      send_msg();
});
