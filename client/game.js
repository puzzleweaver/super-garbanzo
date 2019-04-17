var c = document.getElementById('c2d');
c.width = window.innerWidth;
c.height = window.innerHeight;
var ctx = c.getContext('2d');
ctx.strokeStyle = '#ff0000';
ctx.moveTo(0, 0);
ctx.lineTo(c.width, c.height);
ctx.stroke();
