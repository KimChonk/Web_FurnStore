const jwt = require('jsonwebtoken');

module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'your_default_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Generate JWT token
  generateToken: (payload) => {
    return jwt.sign(payload, module.exports.jwtSecret, {
      expiresIn: module.exports.jwtExpiresIn
    });
  },

  // Verify JWT token
  verifyToken: (token) => {
    return jwt.verify(token, module.exports.jwtSecret);
  }
};
