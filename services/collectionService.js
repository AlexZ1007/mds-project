const connection = require('../server/database');

function queryAsync(sql, params) {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

class CollectionService{
    constructor(){}

    async getUserCards(userId) {
        let result = new Promise((resolve, reject) => {
            connection.query(
                `SELECT c.card_id, c.card_name, c.description, c.mana_points, c.HP_points, c.damage, c.ability, c.card_image, c.level, uc.card_count
                    FROM User_Cards uc
                    JOIN Card c ON uc.card_id = c.card_id
                    WHERE uc.user_id = ?
                    ORDER BY c.card_image ASC`,
                [userId],
                (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                }
            );
        });
        return result;
    }

    saveUserDeck(userId, deckArray) {
        return new Promise((resolve, reject) => {
            connection.query('DELETE FROM Deck WHERE user_id = ?', [userId], (err) => {
                if (err) return reject(err);
    
                const insertPromises = [];
    
                for (let i = 0; i < deckArray.length; i++) {
                    const card = deckArray[i];
                    if (card) {
                        insertPromises.push(
                            new Promise((res, rej) => {
                                connection.query(
                                    'INSERT INTO Deck (user_id, card_id, position) VALUES (?, ?, ?)',
                                    [userId, card.card_id, i],
                                    (err) => (err ? rej(err) : res())
                                );
                            })
                        );
                    }
                }
    
                Promise.all(insertPromises)
                    .then(() => resolve())
                    .catch(reject);
            });
        });

    }
    
    
    
    async getUserDeck(userId) {
        return new Promise((resolve, reject) => {
            connection.query(
                `SELECT d.position, c.card_id, c.card_name, c.card_image, c.HP_points as hp, c.damage as attack, c.mana_points as mana_cost
                 FROM Deck d
                 JOIN Card c ON d.card_id = c.card_id
                 WHERE d.user_id = ?
                 ORDER BY d.position ASC`,
                [userId],
                (err, results) => {
                    if (err) return reject(err);
                    const deck = Array(12).fill(null);
                    results.forEach(row => {
                        deck[row.position] = row;
                    });
                    
                    resolve(deck);
                }
            );
        });
    }

    async validateAndSaveDeck(userId, deck) {
        if (!Array.isArray(deck)) throw new Error('Invalid deck format');
        // Fetch user's card counts
        const userCards = await queryAsync(
            'SELECT card_id, card_count FROM User_Cards WHERE user_id = ?',
            [userId]
        );
        const cardCountMap = {};
        userCards.forEach(row => cardCountMap[row.card_id] = row.card_count);

        // Count cards in the deck
        const deckCardCounts = {};
        deck.forEach(card => {
            if (card && card.card_id) {
                deckCardCounts[card.card_id] = (deckCardCounts[card.card_id] || 0) + 1;
            }
        });

        // Validate
        for (const [cardId, count] of Object.entries(deckCardCounts)) {
            if (!cardCountMap[cardId] || count > cardCountMap[cardId]) {
                throw new Error(`You do not own enough copies of card ID ${cardId}`);
            }
        }
        await this.saveUserDeck(userId, deck);
    }

}

module.exports = CollectionService;