class Card{

    constructor(cardName, description, manaPoints, healthPoints, attackPoints, ability, imageUrl){
        this.cardName = cardName;
        this.description = description;
        this.manaPoints = manaPoints;
        this.healthPoints = healthPoints;
        this.attackPoints = attackPoints;
        this.ability = ability;
        this.imageUrl = imageUrl;
    }

}

module.exports = Card;