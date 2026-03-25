const jwt = require('jsonwebtoken');
const db = require('../config/db');

const verifyToken = async (req, res, next) => {
  const authHeader = req.get('Authorization')?.trim();

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided. Expected: Authorization: Bearer <token>' });
  }

  const bearerToken = authHeader.slice(7).trim();

  if (!bearerToken) {
    return res.status(401).json({ error: 'Invalid token format' });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'Server configuration error - missing JWT secret' });
  }

  try {
    // Check blacklist with graceful error handling
    let blacklisted = { rows: [] };
    try {
      blacklisted = await db.query('SELECT * FROM token_blacklist WHERE token = $1', [bearerToken]);
    } catch (dbErr) {
      console.error('Token blacklist check failed:', dbErr);
      // Fail open if DB error
    }
    if (blacklisted.rows.length > 0) {
      return res.status(401).json({ error: 'Token revoked. Please login again.' });
    }

    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
    req.user = decoded;
    req.token = bearerToken;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token signature' });
    }
    console.error('Auth middleware error:', err);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = verifyToken;
