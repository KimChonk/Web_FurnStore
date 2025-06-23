// Simple in-memory rate limiter
const rateLimitStore = new Map();

const rateLimit = (windowMs = 15 * 60 * 1000, maxRequests = 5) => {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // Clean up old entries
    rateLimitStore.forEach((value, mapKey) => {
      if (now - value.windowStart > windowMs) {
        rateLimitStore.delete(mapKey);
      }
    });
    
    const current = rateLimitStore.get(key) || { count: 0, windowStart: now };
    
    // Reset window if expired
    if (now - current.windowStart > windowMs) {
      current.count = 0;
      current.windowStart = now;
    }
    
    if (current.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil((windowMs - (now - current.windowStart)) / 1000)
      });
    }
    
    current.count++;
    rateLimitStore.set(key, current);
    
    next();
  };
};

// Rate limiter for login attempts (5 attempts per 15 minutes)
const loginRateLimit = rateLimit(15 * 60 * 1000, 5);

// Rate limiter for password reset (3 attempts per hour)
const passwordResetRateLimit = rateLimit(60 * 60 * 1000, 3);

// Rate limiter for registration (3 attempts per hour)
const registrationRateLimit = rateLimit(60 * 60 * 1000, 3);

module.exports = {
  loginRateLimit,
  passwordResetRateLimit,
  registrationRateLimit
};
