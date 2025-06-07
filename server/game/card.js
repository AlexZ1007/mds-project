class Card {
  constructor(id, url, hp, attack, manaCost) {
    this.id = id; 
    this.url = url;
    this.hp = hp;
    this.attack = attack;
    this.manaCost = manaCost;
  }

  getCardMana() {
    return this.manaCost;
  }
}

module.exports = { Card };
