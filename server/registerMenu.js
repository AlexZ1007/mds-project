
function RegMenu(app) { 
    const cors = require('cors');
    const express = require("express");
    const jwt = require('jsonwebtoken');
    const AuthService = require('../services/authService'); 
    const authMiddleware = require('./authMiddleware');

    const auth = new AuthService();
    const SECRET = 'super-secret-key';

    app.use(cors());
    app.use(express.json());

    app.post('/register', async (req, res) => {
        // TODO: check if user is already logged in
        const { username, password, email } = req.body;
        try {
            user = await auth.register(username, password, email);
            const token = jwt.sign({ username: user.user_ID }, SECRET, { expiresIn: '1h' });
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
            const token = jwt.sign({ userId: user.user_ID }, SECRET, { expiresIn: '1h' });
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

    app.get('/me', authMiddleware, (req, res) => {
        res.json({ userId: req.user.userId });
      });
}

module.exports = RegMenu;