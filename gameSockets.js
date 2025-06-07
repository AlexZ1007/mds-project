const { v4: uuidv4 } = require("uuid");
const { Lobby } = require("./server/game/lobby");
const { Player } = require("./server/game/player");


function registerGameEvents(io, socket, match_queue, lobbies) {
  socket.on("message", (data) => {
    console.log("Message from client:", data);
    io.emit("message", data);
  });

  socket.on("find_match", () => {
    const index = match_queue.findIndex((item) => item.id === socket.id);
    if (index === -1) {
      match_queue.push(socket);
    }

    if (match_queue.length >= 2) {
      const player1 = match_queue.shift();
      const player2 = match_queue.shift();

      const lobbyId = uuidv4();
      const url = `/game/game.html?lobby_id=${lobbyId}`;

      const lobby = new Lobby(url);
      lobbies[lobbyId] = lobby;

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

    lobby.players[socket.id] = new Player(socket.id);

    if (lobby.playerSockets.length === 2) {
      const [p1, p2] = lobby.playerSockets;
      lobby.currentTurn = p1.id;
      console.log(`Lobby ${lobbyId} is ready with players: ${p1.id} and ${p2.id}`);

      p1.emit("your_turn");
      p2.emit("opponent_turn");

      p1.emit('player_data', lobby.getDataAboutPlayers(p1.id));
      p2.emit('player_data', lobby.getDataAboutPlayers(p2.id));
    }
  });

  socket.on("end_turn", ({ lobbyId }) => {
    const lobby = lobbies[lobbyId];
    if (!lobby || lobby.currentTurn !== socket.id) return;

    const otherSocket = lobby.playerSockets.find(s => s.id !== socket.id);
    if (!otherSocket) return;

    lobby.currentTurn = otherSocket.id;

    socket.emit("opponent_turn");      // current player sees it's opponent's turn now
    otherSocket.emit("your_turn");     // opponent is now the current player
  });


  socket.on("place_card", ({ lobbyId, row, col, selectedCardId }) => {
    const lobby = lobbies[lobbyId];
    console.log(`Placing card ${selectedCardId} at row ${row}, col ${col}`);

    if (!lobby || lobby.currentTurn !== socket.id) return;

    const player = lobby.players[socket.id];

    let valid = lobby.placeCard(socket.id, selectedCardId, row, col);
    
    if (!valid) {
      return;
    }


    const [p1, p2] = lobby.playerSockets;

    p1.emit('update_map', {
      map: lobby.map
    })
    p2.emit('update_map', {
      map: lobby.map
    });


    p1.emit('player_data', lobby.getDataAboutPlayers(p1.id));
    p2.emit('player_data', lobby.getDataAboutPlayers(p2.id));
    
  });

  socket.on("draw_card", ({ lobbyId }) => {
    const lobby = lobbies[lobbyId];
    if (!lobby || lobby.currentTurn !== socket.id) return;

    const player = lobby.players[socket.id];
    const card = player.drawCard();

    if (!card) {
      return;
    }

    const [p1, p2] = lobby.playerSockets;

    p1.emit('player_data', lobby.getDataAboutPlayers(p1.id));
    p2.emit('player_data', lobby.getDataAboutPlayers(p2.id));
    
  });


}

module.exports = { registerGameEvents };
