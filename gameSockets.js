// gameSockets.js
const { v4: uuidv4 } = require("uuid");

const match_queue = [];
const lobbies = {};

function registerGameEvents(io, socket) {
  socket.on("message", (data) => {
    console.log("Message from client:", data);
    io.emit("message", data);
  });

  socket.on("find_match", () => {
    match_queue.push(socket);

    if (match_queue.length >= 2) {
      const player1 = match_queue.shift();
      const player2 = match_queue.shift();

      const lobbyId = uuidv4();
      const url = `/game/game.html?lobby_id=${lobbyId}`;

      lobbies[lobbyId] = {
        player1,
        player2,
        url,
        playerSockets: [],
        currentTurn: null,
        players: {}
      };

      player1.emit("match_found", { url });
      player2.emit("match_found", { url });

      console.log(`Match made: ${player1.id} vs ${player2.id}`);
    } else {
      socket.emit("waiting_for_match");
      console.log(`${socket.id} is waiting for a match`);
    }
  });

  socket.on("join_lobby", ({ lobbyId }) => {
    const lobby = lobbies[lobbyId];
    if (!lobby) return;

    socket.join(lobbyId);
    lobby.playerSockets.push(socket);
    lobby.players[socket.id] = socket;

    if (lobby.playerSockets.length === 2) {
      const [p1, p2] = lobby.playerSockets;
      lobby.currentTurn = p1.id;

      p1.emit("your_turn");
      p2.emit("opponent_turn");
    }
  });

  socket.on("end_turn", ({ lobbyId }) => {
    const lobby = lobbies[lobbyId];
    if (!lobby || lobby.currentTurn !== socket.id) return;

    const otherId = Object.keys(lobby.players).find(id => id !== socket.id);
    lobby.currentTurn = otherId;

    lobby.players[socket.id].emit("opponent_turn");
    lobby.players[otherId].emit("your_turn");
  });

  socket.on('place_card', ({cardId, lobbyId}) =>{
    const lobby = lobbies[lobbyId];
    if (!lobby || lobby.currentTurn !== socket.id) return;

    const otherId = Object.keys(lobby.players).find(id => id !== socket.id);

    console.log('Card placed: ' +cardId)

    lobby.players[socket.id].emit("place_card_response", {cardId});
    lobby.players[otherId].emit("place_card_response", {cardId});
  })
}

module.exports = { registerGameEvents };
