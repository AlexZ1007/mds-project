
class Player {
  constructor(id, deck = []) {
    this.id = id;
    this.mana = 10;
    this.hp = 20; 
    // Randomise the deck order
    deck.sort(() => Math.random() - 0.5);
    this.deck = deck; 
    this.hand = [deck.shift(), deck.shift(), deck.shift()]; 
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
