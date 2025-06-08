const { Card } = require('./card');

class Player {
  constructor(id) {
    this.id = id;
    this.mana = 10;
    this.hp = 20; 

    // Starting hand and deck
    this.hand = [
      new Card(1, "/img/broom_L1.jpg",2, 7, 3, id),
      new Card(2, "/img/gloomroot_L2.jpg",9, 2, 3, id),
    ]; 

    this.deck = [
      new Card(3, "/img/voidgate_L3.jpg",1, 7, 3, id),
      new Card(4, "/img/enchanted_book_L2.jpg",2, 2, 3, id),
      new Card(5, "/img/hexpaw_L2.jpg",12, 12, 3, id),
    ];
  }

  canPlayCard(card) {
    if (!card || !card.manaCost) {
      console.log('Card is invalid or has no mana cost');
      return false;
    }

    return this.mana >= card.getCardMana();
  }

  playCard(cardId) {
    if(cardId < 0 || cardId >= this.hand.length) {
      return false; // Invalid card ID
    }

    let card = this.hand[cardId];
    if (!this.canPlayCard(card)) {
      return false;
    }

    this.mana -= card.getCardMana();

    const index = this.hand.findIndex(c => c.id === card.id);
    if (index !== -1) {
      this.hand.splice(index, 1);
    }

    this.deck.push(card); 

    return { ...card }; // Optionally return a copy
  }



  drawCard() {

    if (this.deck.length === 0 || this.mana < 1) {
      return false;
    }
    const card = this.deck.shift();
    this.mana -= 1;
    this.hand.push(card);

    return card;
  }

  getPlayerInfo() {
    return {
      id: this.id,
      mana: this.mana,
      hp: this.hp,
      hand: this.hand.map(card => (card.url)),
      deckSize: this.deck.length
    };
  }
}

module.exports = { Player };
