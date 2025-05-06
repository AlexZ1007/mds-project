
function RegMenu(app) { 
    const cors = require('cors');
    const express = require("express");
    const jwt = require('jsonwebtoken');
    const connection = require('./database');

    const AuthService = require('../services/authService');
    const ShopService = require('../services/shopService');
    require('dotenv').config(); 
    const authMiddleware = require('./authMiddleware');


    const auth = new AuthService();
    const shop = new ShopService();

    app.use(cors());
    app.use(express.json());

    app.post('/register', async (req, res) => {
        // TODO: check if user is already logged in
        const { username, password, email } = req.body;
        try {
            user = await auth.register(username, password, email);
            const token = jwt.sign({ username: user.user_id }, process.env.SECRET_KEY, { expiresIn: '1h' });
            res.cookie('token', token, {
                httpOnly: true,
                secure: false,
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
                secure: false,
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
        try{
            const pack = await shop.openPack(pack_info, req.user.userId);
            res.status(202).json({ message: 'Pack opened successfully', pack });
        }catch (e) {
            res.status(402).json({ error: e.message });
        }
    });

    //-------------
    app.get('/me', authMiddleware, (req, res) => {
        res.json({ userId: req.user.userId });
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
    
        const query = `UPDATE Friends_Requests SET status = ? WHERE friends_requests_id = ? AND friend_id = ?`;
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
            SELECT fr.friends_requests_id, u.user_id, u.nickname 
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