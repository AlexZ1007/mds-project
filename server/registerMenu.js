function RegMenu(app) { 
    const cors = require('cors');
    const express = require("express");
    const jwt = require('jsonwebtoken');
    const AuthService = require('../services/authService'); 

    const auth = new AuthService();
    const SECRET = 'super-secret-key';

    app.use(cors());
    app.use(express.json());

    app.post('/register', async (req, res) => {
        const { username, password, email } = req.body;
        try {
            await auth.register(username, password, email);
            res.status(200).json({ message: 'Registered successfully' });
        } catch (e) {
            res.status(400).json({ error: e.message });
        }
    });

    app.post('/login', async (req, res) => {
        const { username, password } = req.body;
        try {
            const user = auth.login(username, password);
            const token = jwt.sign({ username: user.username }, SECRET, { expiresIn: '1h' });
            res.status(201).json({ message: 'Login successful', token });
        } catch (e) {
            res.status(401).json({ error: e.message });
        }
    });
}

module.exports = RegMenu;