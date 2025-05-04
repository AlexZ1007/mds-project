function authMiddleware(req, res, next) {
    const jwt = require('jsonwebtoken');
    const SECRET  = 'super-secret-key'

    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'No token' });
  
    try {
      const decoded = jwt.verify(token, SECRET);
      console.log('Decoded:', decoded);

      req.user = decoded;
  
      // Refresh if token expires in < 5 minutes
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = decoded.exp - now;
  
      if (expiresIn < 300) { // 5 mins
        const newToken = jwt.sign(
          { userId: decoded.userId, username: decoded.username },
          SECRET,
          { expiresIn: '1h' }
        );
  
        res.cookie('token', newToken, {
          httpOnly: true,
          secure: false,
          sameSite: 'Lax',
          maxAge: 3600000
        });
      }
  
      next();
    } catch (err) {
      console.error('Token verification error:', err);
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  module.exports = authMiddleware