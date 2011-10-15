var sensitivity = 0.5, ax = ay = 0;
var messageBox = document.getElementById("messageBox");
var socket = io.connect('http://192.168.228.86');

window.addEventListener('devicemotion', function (e) {
  ax = e.accelerationIncludingGravity.x * sensitivity;
  ay = -e.accelerationIncludingGravity.y * sensitivity;
  socket.emit('orientationChange', { ax: ax, ay: ay});
}, false);

socket.on('showClickMesage', function (data) {
  messageBox.innerHTML = "<h1>" + data.title + "</h1><p>" + data.details + "</p>";
});

var button = document.getElementById("button");

button.addEventListener("click",function(){
  socket.emit('click', { boo: "boo" });
},false)