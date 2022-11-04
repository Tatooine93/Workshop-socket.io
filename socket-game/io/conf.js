const socketio = require('socket.io');

module.exports = function(server) {
  // io server
  const io = socketio(server);

  const players = {};

  io.on("connection", function (socket) {
    
    console.log("Player connected:" + socket.id);

    players[socket.id] = {
    x: 0,
    y: 0,
    size: 20,
    speed: 5,
    c: "#" + (((1 << 24) * Math.random()) | 0).toString(16),
    };

    socket.on("disconnect", function () {
      delete players[socket.id];
    });

      socket.on('move left',  function() { players[socket.id].x -= players[socket.id].speed; });
      socket.on('move up',    function() { players[socket.id].y -= players[socket.id].speed; });
      socket.on('move right', function() { players[socket.id].x += players[socket.id].speed; });
      socket.on('move down',  function() { players[socket.id].y += players[socket.id].speed; });
  });

  function update() {
    io.volatile.emit('players list', Object.values(players))
  };

  setInterval(update, 1000/60);
};
