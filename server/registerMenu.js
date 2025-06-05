
function RegMenu(app) {
    const cors = require('cors');
    const express = require("express");
    const jwt = require('jsonwebtoken');
    const connection = require('./database');

    const AuthService = require('../services/authService');
    const ShopService = require('../services/shopService');
    const CollectionService = require('../services/collectionService');
    require('dotenv').config();
    const authMiddleware = require('./authMiddleware');


    const auth = new AuthService();
    const shop = new ShopService();
    const collection = new CollectionService();

    app.use(cors());
    app.use(express.json());

    app.post('/register', async (req, res) => {
        // TODO: check if user is already logged in
        const { username, password, email } = req.body;
        if (!username || !password || !email) {
            return res.status(400).json({ error: 'All fields are required.' });
        }
        try {
            user = await auth.register(username, password, email);
            const token = jwt.sign({ username: user.user_id }, process.env.SECRET_KEY, { expiresIn: '1h' });
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.MODE == 'prod' ? true : false,
                sameSite: 'Lax',
                maxAge: 3600000
            });
            res.status(200).json({ message: 'Registration successful', token });

        } catch (e) {
            res.status(400).json({ error: e.message });
        }
    });

    app.post('/login', async (req, res) => {
        // TODO: check if user is already logged in
        const { username, password } = req.body;

        try {

            const user = await auth.login(username, password);

            const token = jwt.sign({ userId: user.user_id }, process.env.SECRET_KEY, { expiresIn: '1h' });
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.MODE == 'prod' ? true : false,
                sameSite: 'Lax',
                maxAge: 3600000
            });

            res.status(201).json({ message: 'Login successful', token });
        } catch (e) {
            res.status(401).json({ error: e.message });
        }
    });

    app.post('/pack', authMiddleware, async (req, res) => {
        const { pack_info } = req.body;
        try {
            const pack = await shop.openPack(pack_info, req.user.userId);
            res.status(202).json({ message: 'Pack opened successfully', pack });
        } catch (e) {
            res.status(402).json({ error: e.message });
        }
    });

    //-------------
    app.get('/me', authMiddleware, (req, res) => {
        res.json({ userId: req.user.userId });
    });


    app.get('/check-loggedin', authMiddleware, async (req, res) => {
        let temp = req.user.userId;
        if (temp === undefined) {
            res.status(400).json({ error: 'User not logged in' });
        }
        else {
            res.status(200).json({ message: 'User is logged in', userId: temp });
        }
    });


    app.get('/collection', authMiddleware, async (req, res) => {
        const userId = req.user.userId; // Assuming `authMiddleware` attaches the user object to `req`
        try {
            const cards = await collection.getUserCards(userId);
            res.status(200).json({ cards });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch card collection.' });
        }
    });


    //------------merge-card----------------
    app.post('/merge-card', authMiddleware, async (req, res) => {
        const { card_id, level } = req.body;
        const userId = req.user.userId;

        // Only allow merge for level 1 or 2
        if (![1, 2].includes(level)) {
            return res.status(400).json({ error: 'Only cards of level 1 or 2 can be merged.' });
        }

        // 1. Get the card's name for the current card_id
        const getNameQuery = `SELECT card_name FROM Card WHERE card_id = ? AND level = ?`;
        connection.query(getNameQuery, [card_id, level], (err, nameResults) => {
            if (err || !nameResults.length) {
                return res.status(500).json({ error: 'Database error (get name): ' + (err ? err.message : 'Card not found') });
            }
            const card_name = nameResults[0].card_name;

            // 2. Check if user has at least 2 of this card at this level
            const checkQuery = `
                SELECT uc.card_count
                FROM User_Cards uc
                JOIN Card c ON uc.card_id = c.card_id
                WHERE uc.user_id = ? AND uc.card_id = ? AND c.level = ?
            `;
            connection.query(checkQuery, [userId, card_id, level], (err, results) => {
                if (err) return res.status(500).json({ error: 'Database error (check): ' + err.message });
                if (!results[0] || results[0].card_count < 2) {
                    return res.status(400).json({ error: 'Not enough cards to merge.' });
                }

                // 3. Remove 2 cards of this card_id
                const removeQuery = `
                    UPDATE User_Cards SET card_count = card_count - 2 
                    WHERE user_id = ? AND card_id = ?
                `;
                connection.query(removeQuery, [userId, card_id], (err) => {
                    if (err) return res.status(500).json({ error: 'Database error (remove): ' + err.message });

                    // 4. Find the card_id of the next level card with the same name
                    const nextLevel = level + 1;
                    const findNextCardQuery = `
                        SELECT card_id FROM Card WHERE card_name = ? AND level = ?
                    `;
                    connection.query(findNextCardQuery, [card_name, nextLevel], (err, nextCardResults) => {
                        if (err || !nextCardResults.length) {
                            return res.status(500).json({ error: 'Database error (find next): ' + (err ? err.message : 'Next level card not found') });
                        }
                        const nextCardId = nextCardResults[0].card_id;

                        // 5. Add 1 card of the next level
                        const addQuery = `
                            INSERT INTO User_Cards (user_id, card_id, card_count)
                            VALUES (?, ?, 1)
                            ON DUPLICATE KEY UPDATE card_count = card_count + 1
                        `;
                        connection.query(addQuery, [userId, nextCardId], (err) => {
                            if (err) return res.status(500).json({ error: 'Database error (add): ' + err.message });
                            res.status(200).json({ message: 'Cards merged successfully!' });
                        });
                    });
                });
            });
        });
    });


    app.post('/logout', authMiddleware, (req, res) => {
        res.clearCookie('token');
        res.status(200).json({ message: 'Logout successful' });
    });

    app.get('/user-data', authMiddleware, async (req, res) => {
        const userId = req.query.profile_user_id || req.user.userId;
        try {
            const userData = await auth.getUserData(userId);
            res.status(200).json(userData);
        } catch (error) {
            console.error("Error fetching user data:", error);
            res.status(500).json({ error: 'Failed to fetch user data.' });
        }
    });
    

      app.get('/friends/search', authMiddleware, async (req, res) => {
        const { nickname } = req.query;
        const userId = req.user.userId;

        const query = `
            SELECT u.user_id, u.nickname,
                (SELECT status FROM Friends_Requests fr 
                WHERE (fr.user_id = ? AND fr.friend_id = u.user_id) 
                    OR (fr.user_id = u.user_id AND fr.friend_id = ?) 
                LIMIT 1) AS request_status
            FROM User u
            WHERE u.nickname LIKE ? AND u.user_id != ?
        `;
        connection.query(query, [userId, userId, `%${nickname}%`, userId], (err, results) => {
            if (err) {
                console.error('Error fetching search results:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            console.log('Search results:', results); // Debugging log
            res.status(200).json(results);
        });
    });

    app.post('/friends/request', authMiddleware, async (req, res) => {
        const { friendId } = req.body;
        console.log('Friend ID:', friendId); // Debugging log
    
        const query = `INSERT INTO Friends_Requests (user_id, friend_id, status) VALUES (?, ?, 0)`;
        connection.query(query, [req.user.userId, friendId], (err) => {
            if (err) {
                console.error('Error inserting friend request:', err.message); // Log detailed error
                return res.status(500).json({ error: 'Database error: ' + err.message });
            }
            res.status(200).json({ message: 'Friend request sent' });
        });
    });

    app.post('/friends/respond', authMiddleware, async (req, res) => {
        const { requestId, status } = req.body;
        console.log('Request ID:', requestId, 'Status:', status); // Debugging log
    
        const query = `UPDATE Friends_Requests SET status = ? WHERE friend_request_id = ? AND friend_id = ?`;
        connection.query(query, [status, requestId, req.user.userId], (err) => {
            if (err) {
                console.error('Error updating friend request:', err.message); // Log detailed error
                return res.status(500).json({ error: 'Database error: ' + err.message });
            }
            res.status(200).json({ message: status === 1 ? 'Friend request accepted' : 'Friend request denied' });
        });
    });


    app.get('/friends', authMiddleware, async (req, res) => {
        const userId = req.user.userId;
    
        const friendsQuery = `
            SELECT u.user_id, u.nickname 
            FROM Friends_Requests fr
            JOIN User u ON (u.user_id = fr.friend_id OR u.user_id = fr.user_id)
            WHERE (fr.user_id = ? OR fr.friend_id = ?) AND fr.status = 1 AND u.user_id != ?
        `;
    
        const pendingQuery = `
            SELECT fr.friend_request_id, u.user_id, u.nickname 
            FROM Friends_Requests fr
            JOIN User u ON u.user_id = fr.user_id
            WHERE fr.friend_id = ? AND fr.status = 0
        `;
    
        connection.query(friendsQuery, [userId, userId, userId], (err, friends) => {
            if (err) {
                console.error('Error fetching friends:', err);
                return res.status(500).json({ error: 'Database error' });
            }
    
            connection.query(pendingQuery, [userId], (err, pending) => {
                if (err) {
                    console.error('Error fetching pending requests:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
    
                res.status(200).json({ friends, pending });
            });
        });
    });

}

module.exports = RegMenu;