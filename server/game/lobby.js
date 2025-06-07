
class Lobby {
  map = [
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
  ];

  constructor(url = '') {
    this.url = url;
    this.playerSockets = [];
    this.currentTurn = null;
    this.players = {};
  }

  isValidPlacement(playerId, row) {
    const playerIndex = this.playerSockets.findIndex(sock => sock.id === playerId);
    if (playerIndex === 0) {
      return row === 0 || row === 1;
    } else if (playerIndex === 1) {
      return row === 2 || row === 3;
    }
    return false;
  }

  placeCard(playerId, cardId, row, col) {
    // if (!this.isValidPlacement(playerId, row)) {
    //     return false; // Invalid placement
    // }

    if (this.map[row][col] !== null) {
      return false; // Cell is already occupied
    }

    const player = this.players[playerId];
    let card = player.playCard(cardId);

    if (!card) {
      return false; 
    }
    this.map[row][col] = card;

    return true; 
  }

  getDataAboutPlayers(playerId) {
    const player = this.players[playerId];
    const opponentId = Object.keys(this.players).find(id => id !== playerId);
    const opponent = this.players[opponentId];

    let opponentData = opponent.getPlayerInfo();
    let playerData = player.getPlayerInfo();

    return {
      player: playerData,
      opponent: {
        id: opponentData.id,
        mana: opponentData.mana,
        hp: opponentData.hp,
      },
      map: this.map,
      currentTurn: this.currentTurn
    };

  }
}

module.exports = { Lobby };
