const socket = io();

/* const player = {
    x: 0,
    y: 0,
    size: 20,
    speed: 5
}; */

let players = [];

socket.on('players list', function (list) {
    players = list;
});

const ctx = canvas.getContext("2d");

/* function drawPlayer() {
    const {x, y, size} = player;
    ctx.beginPath();
    ctx.rect(x, y, size, size);
    ctx.fill();
}; */

function drawPlayers() {
    players.forEach(function ({x, y, size, c}) {
        ctx.beginPath();
        ctx.rect(x, y, size, size);
        ctx.fillStyle = c;
        ctx.fill();
    });
};

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayers();
    movePlayer();
    requestAnimationFrame(update);
}

requestAnimationFrame(update);

const keyboard = {};

window.onkeydown = function(e) {
    keyboard[e.key] = true;
};

window.onkeyup = function(e) {
    delete keyboard[e.key];
};

/* function movePlayer() {
    if (keyboard["ArrowLeft"]) player.x -= player.speed; // left
    if (keyboard["ArrowUp"]) player.y -= player.speed; // up
    if (keyboard["ArrowRight"]) player.x += player.speed; // right
    if (keyboard["ArrowDown"]) player.y += player.speed; // down
}; */

function movePlayer() {
    if (keyboard['ArrowLeft']) socket.emit('move left');
    if (keyboard['ArrowUp']) socket.emit('move up');
    if (keyboard['ArrowRight']) socket.emit('move right');
    if (keyboard['ArrowDown']) socket.emit('move down');
};