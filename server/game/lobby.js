
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
    this.totalTurns = 0;
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

  getBattles(){
    const battles = [];

    for(let column = 0; column < this.map[0].length; column++) {
      const card1 = this.map[1][column];
      const card2 = this.map[2][column];
     
      if (card1 || card2) {
        let type = card1 && card2 ? 'battle' : 'player_damage';
       


        if(type === 'battle') {
          // If both cards are present, calculate damage
          const damageToCard1 = card2.attack;
          const damageToCard2 = card1.attack;

          card1.hp -= damageToCard1;
          card2.hp -= damageToCard2;

          if (card1.hp <= 0) {
            this.map[1][column] = null; // Card 1 is destroyed
          }
          if (card2.hp <= 0) {
            this.map[2][column] = null; // Card 2 is destroyed
          }
        } else if (type === 'player_damage') {
          // If only one card is present, apply damage to the player
          const playerId = card1 ? card1.ownerId : card2.ownerId;
          const player = Object.values(this.players).find(p => p.id !== playerId);
          const damage = card1 ? card1.attack : card2.attack;
          player.hp -= damage;
        }


        battles.push({
          card1: card1,
          card2: card2,
          column: column,
          type: type
        });

      }

    }

    return battles;

  }

  moveCardsForward() {
    for (let col = 0; col < this.map[0].length; col++) {
      if(this.map[1][col] == null){
        this.map[1][col] = this.map[0][col];
        this.map[0][col] = null;
      }
      if(this.map[2][col] == null){
        this.map[2][col] = this.map[3][col];
        this.map[3][col] = null;
      }
    }
  }
}

module.exports = { Lobby };
