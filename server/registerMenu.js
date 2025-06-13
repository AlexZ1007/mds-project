
function RegMenu(app) {
    // ====== Imports and Service Instantiations ======
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

    // ====== Middleware ======
    app.use(cors());
    app.use(express.json());

    // ====== Auth & User Routes ======

    // Register a new user
    app.post('/register', async (req, res) => {
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


    // Login
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

    // Logout
    app.post('/logout', authMiddleware, (req, res) => {
        res.clearCookie('token');
        res.status(200).json({ message: 'Logout successful' });
    });

    // Get current user ID
    app.get('/me', authMiddleware, (req, res) => {
        res.json({ userId: req.user.userId });
    });

    // Check if user is logged in
    app.get('/check-loggedin', authMiddleware, async (req, res) => {
        let temp = req.user.userId;
        if (temp === undefined) {
            res.status(400).json({ error: 'User not logged in' });
        }
        else {
            res.status(200).json({ message: 'User is logged in', userId: temp });
        }
    });

    // Get user data (with access control)
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

    // ====== Collection & Card Routes ======

    // Get user's card collection
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


    // Merge cards
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

    
    // ====== Friends Routes ======

    // Search for friends by nickname
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


    // Send a friend request
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


    // Respond to a friend request
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


    // Get friends and pending requests
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

    // ====== Shop Routes ======

    // Open a pack
    app.post('/pack', authMiddleware, async (req, res) => {
        const { pack_info } = req.body;
        try {
            const pack = await shop.openPack(pack_info, req.user.userId);
            res.status(202).json({ message: 'Pack opened successfully', pack });
        } catch (e) {
            res.status(402).json({ error: e.message });
        }
    });

    // Get available cards in shop
    app.get('/shop/cards', authMiddleware, async (req, res) => {
        const userId = req.user.userId;
        try {
            const result = await shop.getAvailableCards(userId);
            res.status(200).json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // List a card for sale
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

    // Buy a card from the shop
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

    // Predict price for a card
    app.post('/predict-price', authMiddleware, async (req, res) => {
        const { card_id } = req.body;
        try {
            const result = await shop.predictPrice(card_id);
            res.json(result);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
    
 
    // ====== Deck Routes ======

    // Save user's deck
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

    // Get user's deck    
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