
function RegMenu(app) { 
    const cors = require('cors');
    const express = require("express");
    const jwt = require('jsonwebtoken');

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

    app.get('/me', authMiddleware, (req, res) => {
        res.json({ userId: req.user.userId });
      });

}

module.exports = RegMenu;