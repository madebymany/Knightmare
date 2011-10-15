
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('socket.io', __dirname + '../node_modules/socket.io/node_modules/socket.io-client/dist/');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Knightmare'
  });
});

app.get('/ipad', function(req, res){
  res.render('ipad', {
    title: 'Knightmare'
  });
});

app.listen(3002);
console.log("Express server listening on port %d", app.address().port);



io.sockets.on('connection', function (socket) {
  
  socket.on('orientationChange', function (msg) {
    socket.broadcast.emit('changeOrientation',msg);
  });
  
  socket.on('click', function (msg) {
    socket.broadcast.emit('clientClick',msg);
  });
  
  socket.on('clickMessage', function (msg) {
    socket.broadcast.emit('showClickMesage',msg);
  });
  
});
