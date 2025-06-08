class Card {
  constructor(id, url, hp, attack, manaCost, ownerId) {
    this.id = id; 
    this.url = url;
    this.hp = 1;
    this.attack = attack;
    this.manaCost = manaCost;
    this.ownerId = ownerId; // ID of the player who owns this card
  }

  getCardMana() {
    return this.manaCost;
  }
}

module.exports = { Card };
