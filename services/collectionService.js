const connection = require('../server/database');
const User = require('../server/user');

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
                `SELECT d.position, c.card_id, c.card_name, c.card_image
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
    
}

module.exports = CollectionService;