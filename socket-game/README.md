# Game with Socket.io
We are gonna use HTML5, Node.js et socket.io. to create a real time multiplayers game.

The game is drawn inside a `<canvas>` in `/public/index.html`,<br> and developped in `/public/game.js` inside the `public` folder.
The server is developped into `conf.js` inside `io` folder.

By default, the Socket.IO server exposes a client bundle at `/socket.io/socket.io.js`.

<br>

## Client side `/public/game.js`

<br>

- Player implementation

  ```js
  const player = {
    x: 0,
    y: 0,
    size: 20,
    speed: 5,
  };
  ```

- Always give the 2d context to the canvas

  ```js
  const ctx = canvas.getContext("2d");
  ```

- Draw the Player into the canvas at his position (x,y)

  ```js
  function drawPlayers() {
    const { x, y, size } = player;
    ctx.beginPath();
    ctx.rect(x, y, size, size);
    ctx.fill();
  }
  ```

- Make a function to refresh the drawings at 60 fps rate

  ```js
  function update() {
    // 1. Erase the drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 2. Draw the Player
    drawPlayers();
    // 3. call the refresh function
    requestAnimationFrame(update);
  }
  // first call of the function
  requestAnimationFrame(update);
  ```

- Add the keystroke management (this technique allow us to register multiples keystrokes simultaneously)

  ```js
  const keyboard = {};

  // It add the key to the object "keyboard" when it's press down
  window.onkeydown = function (e) {
    keyboard[e.key] = true;
  };

  // It delete the key from the "keyboard" object when the key is     released
  window.onkeyup = function (e) {
    delete keyboard[e.key];
  };
  ```

- Add a function to move the Player with keybinds

  ```js
  function movePlayer() {
    if (keyboard["ArrowLeft"]) player.x -= player.speed; // left
    if (keyboard["ArrowUp"]) player.y -= player.speed; // up
    if (keyboard["ArrowRight"]) player.x += player.speed; // right
    if (keyboard["ArrowDown"]) player.y += player.speed; // down
  }
  ```

- Finally go back to the update function and add the movePlayer function into it (this will also refresh the movement 60 fps rate)

  ```js
  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    movePlayer(); // this line is added to the update() function
    drawPlayers();
    requestAnimationFrame(update);
  }
  ```

## Server side `/io/conf.js`

<br>

In order to have a multiplayers game in real time, we need a server who collect all the informations relative to the players and emit them to for the other players.

<br>

- The server will generate a new Player when a new client is connected, added into the player's list and deleted when the client disconnect

  ```js
  const socketio = require("socket.io");

  module.exports = function (server) {
    // io server
    const io = socketio(server);

    // game state (players list)
    const players = {};

    io.on("connection", function (socket) {
      //console.log('A player is connected, id :socket.id');
      // register new player
      players[socket.id] = {
        x: 0,
        y: 0,
        size: 20,
        speed: 5,
        c: "#" + (((1 << 24) * Math.random()) | 0).toString(16),
      };

      // delete disconnected player
      socket.on("disconnect", function () {
        delete players[socket.id];
      });
    });
  };
  ```

- Add a function to emit the state of the game (the Players' state) at a 60 fps rate
  

  ```js
  //module.exports = function (server) {
    function update() {
      io.volatile.emit('players list', Object.values(players));
    }

    setInterval(update, 1000/60);
  //};
  ```
  _The "volatile" flag indicates that the package can be lost (disconnection, latency)_
  <br>

### Client Update `/public/game.js`

<br>

- We don't need the Player creation anymore instead we need the state of all Players in the game<br>


  ```js
  const socket = io();

  // const player = {
  //   x: 0,
  //   y: 0,
  //   size: 20,
  //   speed: 5
  // };

  let players = [];
  ```
  _If your front is served on the same domain as your server, you can simply use: const socket = io();_

- We need a loot to render (draw) each Players container in the array "Players"

  ```js
  //function drawPlayers() {
  //const { x, y, size } = player;
  //ctx.beginPath();
  //ctx.rect(x, y, size, size);
  //ctx.fill();
  //};

  function drawPlayers() {
    players.forEach(function ({ x, y, size, c }) {
      ctx.beginPath();
      ctx.rect(x, y, size, size);
      ctx.fillStyle = c;
      ctx.fill();
    });
  }
  ```

- Now we need to listen to the server to update the Players' list

  ```js
  socket.on("players list", function (list) {
    players = list;
  });
  ```

- The client is no longer updating his position directly into the client instead, we need to send his input keys to the server

  ```js
  function movePlayer() {
    if (keyboard["ArrowLeft"]) socket.emit("move left");
    if (keyboard["ArrowUp"]) socket.emit("move up");
    if (keyboard["ArrowRight"]) socket.emit("move right");
    if (keyboard["ArrowDown"]) socket.emit("move down");
  }
  ```
  <br>

## Server Update `/io/conf.js`

<br>

- Finaly on the server side we need to listen to all the Players to update their states

  ```js
  //io.on("connection", function (socket) {
    //...
    socket.on("move left", function () {
      players[socket.id].x -= players[socket.id].speed;
    });
    socket.on("move up", function () {
      players[socket.id].y -= players[socket.id].speed;
    });
    socket.on("move right", function () {
      players[socket.id].x += players[socket.id].speed;
    });
    socket.on("move down", function () {
      players[socket.id].y += players[socket.id].speed;
    });
  //});
  ```