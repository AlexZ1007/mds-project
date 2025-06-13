const connection = require('../server/database');
const shopObserver = require('./shopObserver');
const axios = require('axios');


function queryAsync(sql, params) {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

function beginTransactionAsync() {
    return new Promise((resolve, reject) => {
        connection.beginTransaction(err => {
            if (err) return reject(err);
            resolve();
        });
    });
}

function commitAsync() {
    return new Promise((resolve, reject) => {
        connection.commit(err => {
            if (err) return reject(err);
            resolve();
        });
    });
}

function rollbackAsync() {
    return new Promise((resolve) => {
        connection.rollback(() => resolve());
    });
}

class ShopService {

    constructor() { }

    async openPack(pack_info, userId) {
        try {
            // Check user balance
            const userRows = await queryAsync('SELECT balance FROM User WHERE user_id = ?', [userId]);
            if (!userRows.length) throw new Error('User not found!');
            const user_balance = userRows[0].balance;
            if (user_balance - pack_info.cost < 0)
                throw new Error('Not enough coins!');

            // Deduct pack cost
            await queryAsync('UPDATE User SET balance = balance - ? WHERE user_id = ?', [pack_info.cost, userId]);

            // Get all cards
            const cards = await queryAsync('SELECT * FROM Card');

            // Select random cards
            let result = [];
            if (pack_info.type == 1) {
                const randomIndex = Math.floor(Math.random() * cards.length);
                result.push(cards[randomIndex]);
            } else if (pack_info.type == 2) {
                for (let i = 0; i < 3; i++) {
                    const randomIndex = Math.floor(Math.random() * cards.length);
                    result.push(cards[randomIndex]);
                }
            }
            // Add cards to user
            for (let card of result) {
                const exists = await queryAsync(
                    'SELECT * FROM User_Cards WHERE user_id = ? AND card_id = ?',
                    [userId, card.card_id]
                );
                if (exists.length > 0) {
                    await queryAsync(
                        'UPDATE User_Cards SET card_count = card_count + 1 WHERE user_id = ? AND card_id = ?',
                        [userId, card.card_id]
                    );
                } else {
                    await queryAsync(
                        'INSERT INTO User_Cards (user_id, card_id, card_count) VALUES (?, ?, 1)',
                        [userId, card.card_id]
                    );
                }
            }
            return result;
        } catch (err) {
            throw err;
        }
    }


    async getAvailableCards(userId) {
        try {
            const query = 
                `SELECT s.shop_ID, s.seller_id, s.card_id, s.price_listed, c.card_name, c.card_image, c.level
                FROM Shop s
                JOIN Card c ON s.card_id = c.card_id
                WHERE s.seller_id != ? AND s.sold = 0`;
            const results = await queryAsync(query, [userId]);
            return results;
        } catch (err) {
            throw err;
        }
    }


    async listCardForSale(userId, card_id, price) {
        try {
            await beginTransactionAsync();

            const userCards = await queryAsync(
                'SELECT card_count FROM User_Cards WHERE user_id = ? AND card_id = ?',
                [userId, card_id]
            );
            if (!userCards.length || userCards[0].card_count < 1) {
                await rollbackAsync();
                throw new Error('Not enough cards to sell.');
            }

            await queryAsync(
                `UPDATE User_Cards SET card_count = card_count - 1 
                WHERE user_id = ? AND card_id = ?`,
                [userId, card_id]
            );

            await queryAsync(
                `INSERT INTO Shop (seller_id, card_id, price_listed, sold, date_listed, date_sold)
                 VALUES (?, ?, ?, 0, NOW(), '1000-01-01 00:00:00')`,
                [userId, card_id, price]
            );

            await commitAsync();
            shopObserver.notifyNewListing();
            return { message: 'Card listed for sale.' };
        } catch (err) {
            await rollbackAsync();
            throw err;
        }
    }

    async buyCard(buyerId, shop_ID) {
         try {
            const listings = await queryAsync('SELECT * FROM Shop WHERE shop_ID = ? AND sold = 0', [shop_ID]);
            if (!listings.length) throw new Error('Listing not found.');
            const listing = listings[0];
            if (listing.seller_id === buyerId) throw new Error('Cannot buy your own card.');

            const buyers = await queryAsync('SELECT balance FROM User WHERE user_id = ?', 
                                            [buyerId]);
            if (!buyers.length || buyers[0].balance < listing.price_listed) 
                throw new Error('Not enough coins.');

            await beginTransactionAsync();

            await queryAsync('UPDATE User SET balance = balance - ? WHERE user_id = ?', 
                            [listing.price_listed, buyerId]);
            await queryAsync('UPDATE User SET balance = balance + ? WHERE user_id = ?', 
                            [listing.price_listed, listing.seller_id]);

            await queryAsync(
                `INSERT INTO User_Cards (user_id, card_id, card_count) VALUES (?, ?, 1) 
                ON DUPLICATE KEY UPDATE card_count = card_count + 1`,
                [buyerId, listing.card_id]
            );
            await queryAsync(
                'UPDATE Shop SET sold = 1, date_sold = NOW() WHERE shop_ID = ?',
                [shop_ID]
            );

            await commitAsync();
            return { message: 'Card purchased successfully.' };
        } catch (err) {
            await rollbackAsync();
            throw err;
        }
    }


    async predictPrice(card_id) {
        // Fetch card features from DB
        const cardResults = await queryAsync(
            `SELECT level, damage, HP_points, mana_points FROM Card WHERE card_id = ?`,
            [card_id]
        );
        if (!cardResults.length) throw new Error('Card not found.');
        const card = cardResults[0];
        try {
            const response = await axios.post('http://localhost:5001/predict', {
                level: card.level,
                damage: card.damage,
                HP_points: card.HP_points,
                mana_points: card.mana_points,
                sold: 0,
                time_on_market: 0
            });
            return { predicted_price: response.data.predicted_price };
        } catch (e) {
            throw new Error('Prediction service unavailable.');
        }
    }
}

module.exports = ShopService;