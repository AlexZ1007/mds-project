function authMiddleware(req, res, next) {
    const jwt = require('jsonwebtoken');

    const token = req.cookies.token;
    if (!token) {
        console.error('No token provided');
        return res.status(401).json({ error: 'No token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        console.log('Decoded token:', decoded);

        req.user = decoded;

        // Refresh token if it expires in less than 5 minutes
        const now = Math.floor(Date.now() / 1000);
        const expiresIn = decoded.exp - now;

        if (expiresIn < 300) { // 5 minutes
            const newToken = jwt.sign(
                { userId: decoded.userId, username: decoded.username },
                process.env.SECRET_KEY,
                { expiresIn: '1h' }
            );

            res.cookie('token', newToken, {
                httpOnly: true,
                secure: false, // Set to true if using HTTPS
                sameSite: 'Lax',
                maxAge: 3600000 // 1 hour
            });

            console.log('Token refreshed and sent to client.');
        }

        next();
    } catch (err) {
        console.error('Token verification error:', err);
        return res.status(401).json({ error: 'Invalid token' });
    }
}

module.exports = authMiddleware;