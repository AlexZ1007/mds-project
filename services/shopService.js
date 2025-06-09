const connection = require('../server/database');


class ShopService {

    constructor() { }

    async openPack(pack_info, userId) {
        let user_balance = await new Promise((resolve, reject) => {
            connection.query('Select balance from User where user_id = ?',
                [userId],
                (err, results) => {
                    if (err) return reject(err);
                    resolve(results[0].balance);
                }
            )

        });

        if (user_balance - pack_info.cost < 0)
            throw new Error('Not enough coins!');
        await new Promise((resolve, reject) => {
            connection.query(
                'UPDATE User SET balance = balance - ? WHERE user_id = ?',
                [pack_info.cost, userId],
                (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                }
            );
        });

        const cards = await new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM Card',
                (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                }
            );
        });
        let result = []
        let randomIndex = 0;
        if (pack_info.type == 1) {

            randomIndex = Math.floor(Math.random() * cards.length);
            result.push(cards[randomIndex]);
        } else if (pack_info.type == 2) {
            for (let i = 0; i < 3; i++) {
                randomIndex = Math.floor(Math.random() * cards.length);
                result.push(cards[randomIndex]);
            }
        }
        for (let card of result) {
            console.log(card);
            let exists = await new Promise((resolve, reject) => {
                connection.query(
                    'Select * from User_Cards where user_id = ? and card_id = ?',
                    [userId, card.card_id],
                    (err, results) => {
                        if (err) return reject(err);
                        resolve(results);
                    }
                );
            });
            if (exists.length > 0) {
                await new Promise((resolve, reject) => {
                    connection.query(
                        'UPDATE User_Cards SET card_count = card_count + 1 WHERE user_id = ? and card_id = ?',
                        [userId, card.card_id],
                        (err, results) => {
                            if (err) return reject(err);
                            resolve(results);
                        }
                    );
                });


            } else {
                await new Promise((resolve, reject) => {
                    connection.query(
                        'INSERT INTO User_Cards (user_id, card_id, card_count) VALUES (?, ?, 1)',
                        [userId, card.card_id],
                        (err, results) => {
                            if (err) return reject(err);
                            resolve(results);
                        }
                    );
                });
            }
        }
        return result;
    }

}

module.exports = ShopService;