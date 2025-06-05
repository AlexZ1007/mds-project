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
}

module.exports = CollectionService;