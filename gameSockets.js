const { v4: uuidv4 } = require("uuid");
const { Lobby } = require("./server/game/lobby");
const { Player } = require("./server/game/player");
const { Card } = require("./server/game/card");
const CollectionService = require("./services/collectionService");
const userService = require("./services/userService");

const collectionService = new CollectionService();
const user_service = new userService();

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

 socket.on("join_lobby", async ({ lobbyId }) => {
  const lobby = lobbies[lobbyId];
  if (!lobby) return;

  socket.join(lobbyId);
  lobby.playerSockets.push(socket);

  try {
    const deckData = await collectionService.getUserDeck(socket.user.userId);

    const playerDeck = deckData
      .map(cardData => {
        if (!cardData) return null;
        return new Card(
          cardData.card_id,
          cardData.card_image,
          cardData.hp,
          cardData.attack,
          cardData.mana_cost,
          socket.id 
        );
      })
      .filter(card => card !== null);


    // Attach player to lobby
    lobby.players[socket.id] = new Player(socket.id, playerDeck);

    // Check if both players have joined
    if (lobby.playerSockets.length === 2) {
      const [p1, p2] = lobby.playerSockets;
      lobby.currentTurn = p1.id;
      console.log(`Lobby ${lobbyId} is ready with players: ${p1.id} and ${p2.id}`);

      p1.emit("your_turn");
      p2.emit("opponent_turn");

      p1.emit("player_data", lobby.getDataAboutPlayers(p1.id));
      p2.emit("player_data", lobby.getDataAboutPlayers(p2.id));
    }

  } catch (err) {
    console.error("Failed to load player deck for lobby:", err);
    socket.emit("error", { message: "Failed to load deck. Please try again later." });
  }
});


  socket.on("end_turn", ({ lobbyId }) => {
    const lobby = lobbies[lobbyId];
    if (!lobby || lobby.currentTurn !== socket.id) return;

    const otherSocket = lobby.playerSockets.find(s => s.id !== socket.id);
    if (!otherSocket) return;

    lobby.currentTurn = otherSocket.id;
    lobby.totalTurns++;
    socket.emit("opponent_turn");      // current player sees it's opponent's turn now



    let [p1Socket, p2Socket] = lobby.playerSockets;
    let player1 = lobby.players[p1Socket.id];
    let player2 = lobby.players[p2Socket.id];


    if (lobby.totalTurns % 2 === 0) {
      const battles = lobby.getBattles();

      for (const battle of battles) {
        if (battle.type === 'battle') {
          p1Socket.emit('battle', { card1: battle.card1, card2: battle.card2, column: battle.column });
          p2Socket.emit('battle', { card1: battle.card1, card2: battle.card2, column: battle.column });
        } else {
          const attackerCard = battle.card1 || battle.card2;
          const victimSocket = lobby.playerSockets.find(s => s.id !== attackerCard.ownerId);
          const attackerSocket = lobby.playerSockets.find(s => s.id === attackerCard.ownerId);

          victimSocket.emit('player_damage', { card: attackerCard, column: battle.column });
          attackerSocket.emit('opponent_damage', { card: attackerCard, column: battle.column });

          const victim = lobby.players[victimSocket.id];
          if (victim.hp <= 0) {
            p1Socket.emit('player_data', lobby.getDataAboutPlayers(player1.id));
            p2Socket.emit('player_data', lobby.getDataAboutPlayers(player2.id));

            const winnerReward =  { status: 'win', coins:120, trophies: 30 };
            const loserReward = { status: 'lose', coins: 40, trophies: -30 };

            attackerSocket.emit('game_over', winnerReward);
            victimSocket.emit('game_over', loserReward);

            user_service.updateUserAfterGame(attackerSocket.user.userId, winnerReward);
            user_service.updateUserAfterGame(victimSocket.user.userId, loserReward);

            return;
          }
        }

        // continue normal loop stuff
        p1Socket.emit('player_data', lobby.getDataAboutPlayers(player1.id));
        p2Socket.emit('player_data', lobby.getDataAboutPlayers(player2.id));

        p1Socket.emit('update_map', { map: lobby.map });
        p2Socket.emit('update_map', { map: lobby.map });
      }

      // post-battle phase
      lobby.moveCardsForward();

      p1Socket.emit('update_map', { map: lobby.map });
      p2Socket.emit('update_map', { map: lobby.map });

      player1.mana += 6;
      player2.mana += 6;

      player1.drawCard();
      player2.drawCard();

      p1Socket.emit('player_data', lobby.getDataAboutPlayers(player1.id));
      p2Socket.emit('player_data', lobby.getDataAboutPlayers(player2.id));
    }


    otherSocket.emit("your_turn");     // opponent is now the current player
  });


  socket.on("place_card", ({ lobbyId, row, col, selectedCardId }) => {
    const lobby = lobbies[lobbyId];

    // get the index of the socket in the lobby's playerSockets
    const playerIndex = lobby.playerSockets.findIndex(s => s.id === socket.id);
    if ((playerIndex === 0 && (row == 2 || row == 3)) || playerIndex === 1 && (row == 0 || row == 1)) {
      let message
      if(playerIndex == 0)
        message = 'You cannot place a card in this row. You can only place rows in the first 2 rows(up side of the board).';
      else
        message = 'You cannot place a card in this row. You can only place rows in the last 2 rows(down side of the board).';

      socket.emit('error', { message: message});
      return;

    }


    console.log(`Placing card ${selectedCardId} at row ${row}, col ${col}`);

    if (!lobby || lobby.currentTurn !== socket.id) return;


    let valid = lobby.placeCard(socket.id, selectedCardId, row, col);
    
    if (!valid) {
      socket.emit('error', { message: "Not enough mana or invalid placement." });
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
