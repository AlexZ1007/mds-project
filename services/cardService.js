const connection = require('../server/database');

class cardService {
    async mergeCard(userId, card_id, level) {
        if (![1, 2].includes(level)) {
            throw new Error('Only cards of level 1 or 2 can be merged.');
        }

        // 1. Get the card's name for the current card_id
        const cardName = await new Promise((resolve, reject) => {
            connection.query(
                `SELECT card_name FROM Card WHERE card_id = ? AND level = ?`,
                [card_id, level],
                (err, results) => {
                    if (err || !results.length) return reject(new Error('Database error (get name): ' + (err ? err.message : 'Card not found')));
                    resolve(results[0].card_name);
                }
            );
        });

        // 2. Check if user has at least 2 of this card at this level
        const cardCount = await new Promise((resolve, reject) => {
            connection.query(
                `SELECT uc.card_count
                 FROM User_Cards uc
                 JOIN Card c ON uc.card_id = c.card_id
                 WHERE uc.user_id = ? AND uc.card_id = ? AND c.level = ?`,
                [userId, card_id, level],
                (err, results) => {
                    if (err) return reject(new Error('Database error (check)'));
                    if (!results[0] || results[0].card_count < 2) return reject(new Error('Not enough cards to merge.'));
                    resolve(results[0].card_count);
                }
            );
        });

        // 3. Remove 2 cards of this card_id
        await new Promise((resolve, reject) => {
            connection.query(
                `UPDATE User_Cards SET card_count = card_count - 2 WHERE user_id = ? AND card_id = ?`,
                [userId, card_id],
                (err) => {
                    if (err) return reject(new Error('Database error (remove)'));
                    resolve();
                }
            );
        });

        // 4. Find the card_id of the next level card with the same name
        const nextCardId = await new Promise((resolve, reject) => {
            connection.query(
                `SELECT card_id FROM Card WHERE card_name = ? AND level = ?`,
                [cardName, level + 1],
                (err, results) => {
                    if (err || !results.length) return reject(new Error('Next level card not found or database error (find next)'));
                    resolve(results[0].card_id);
                }
            );
        });

        // 5. Add 1 card of the next level
        await new Promise((resolve, reject) => {
            connection.query(
                `INSERT INTO User_Cards (user_id, card_id, card_count)
                 VALUES (?, ?, 1)
                 ON DUPLICATE KEY UPDATE card_count = card_count + 1`,
                [userId, nextCardId],
                (err) => {
                    if (err) return reject(new Error('Database error (add)'));
                    resolve();
                }
            );
        });

        return { message: 'Cards merged successfully!' };
    }
}

module.exports = cardService;