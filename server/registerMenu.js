
function RegMenu(app) {
    const cors = require('cors');
    const express = require("express");
    const jwt = require('jsonwebtoken');
    const connection = require('./database');

    const AuthService = require('../services/authService');
    const ShopService = require('../services/shopService');
    const CollectionService = require('../services/collectionService');
    const FriendService = require('../services/friendService');
    const CardService = require('../services/cardService');

    require('dotenv').config();
    const authMiddleware = require('./authMiddleware');

    const auth = new AuthService();
    const shop = new ShopService();
    const collection = new CollectionService();
    const friends = new FriendService();
    const card = new CardService();

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
        const userId = req.query.userid || req.user.userId;
        try {
            const cards = await collection.getUserCards(userId);
            res.status(200).json({ cards });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch card collection.' });
        }
    });


    app.post('/merge-card', authMiddleware, async (req, res) => {
        const { card_id, level } = req.body;
        const userId = req.user.userId;

        try{
            const result = await card.mergeCard(userId, card_id, level);
            res.status(200).json(result);
        } catch(err){
            res.status(400).json({error: err.message});
        }
    });


    app.post('/logout', authMiddleware, (req, res) => {
        res.clearCookie('token');
        res.status(200).json({ message: 'Logout successful' });
    });


    app.get('/user-data', authMiddleware, async (req, res) => {
        const userId = req.user.userId;
        const profileUserId = req.query.profile_user_id || userId;

        try {
            const userData = await auth.getUserDataIfAllowed(userId, profileUserId);
            res.status(200).json(userData);
        } catch (error) {
            const status = error.message === 'Access denied' ? 403 : 500;
            res.status(status).json({ error: error.message });
        }
    });
    

    app.get('/friends/search', authMiddleware, async (req, res) => {
        const { nickname } = req.query;
        const userId = req.user.userId;

        try {
            const results = await friends.searchFriends(userId, nickname);
            res.status(200).json(results);
        } catch (err) {
            console.error('Error fetching search results:', err);
            res.status(500).json({ error: 'Database error' });
        }
    });


    app.post('/friends/request', authMiddleware, async (req, res) => {
        const { friendId } = req.body;
        try{
            const result = await friends.sendFriendRequest(req.user.userId, friendId);
            res.status(200).json(result);
        } catch (err) {
            console.error('Error inserting friend request:', err.message);
            res.status(500).json({ error: 'Database error: ' + err.message });
        }
    });


    app.post('/friends/respond', authMiddleware, async (req, res) => {
        const { requestId, status } = req.body;
        try {
            const result = await friends.respondToFriendRequest(requestId, status, req.user.userId);
            res.status(200).json(result);
        } catch (err) {
            console.error('Error updating friend request:', err.message);
            res.status(500).json({ error: 'Database error: ' + err.message });
        }
    });


    app.get('/friends', authMiddleware, async (req, res) => {
        const userId = req.query.userid || req.user.userId;
        try {
            const result = await friends.getFriendsAndPending(userId);
            res.status(200).json(result);
        } catch (err) {
            console.error('Error fetching friends:', err);
            res.status(500).json({ error: 'Database error' });
        }
    });


    app.get('/shop/cards', authMiddleware, async (req, res) => {
        const userId = req.user.userId;
        try {
            const result = await shop.getAvailableCards(userId);
            res.status(200).json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    
    app.post('/shop/list', authMiddleware, async (req, res) => {
        const userId = req.user.userId;
        const { card_id, price } = req.body;
        try {
            const result = await shop.listCardForSale(userId, card_id, price);
            res.status(200).json(result);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    });

    
    app.post('/shop/buy', authMiddleware, async (req, res) => {
        const buyerId = req.user.userId;
        const { shop_ID } = req.body;

        try {
            const result = await shop.buyCard(buyerId, shop_ID);
            res.status(200).json(result);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    });


    app.post('/predict-price', authMiddleware, async (req, res) => {
        const { card_id } = req.body;
        try {
            const result = await shop.predictPrice(card_id);
            res.json(result);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
    
 
    app.post('/deck', authMiddleware, async (req, res) => {
        const userId = req.user.userId;
        const { deck } = req.body;
        try {
            await collection.validateAndSaveDeck(userId, deck);
            res.status(200).json({ message: 'Deck saved successfully' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    
    app.get('/deck', authMiddleware, async (req, res) => {
        const userId = req.user.userId;
        try {
            const deck = await collection.getUserDeck(userId);
            res.status(200).json({ deck });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch deck.' });
        }
    });
}

module.exports = RegMenu;