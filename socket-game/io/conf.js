const socketio = require('socket.io');

module.exports = function(server) {
  // io server
  const io = socketio(server);
};
