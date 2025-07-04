const jwt = require('jsonwebtoken');
const { verifyToken } = require('../config/jwt');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

// Admin authorization
const adminAuth = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
};

// Warehouse authorization (admin and warehouse staff)
const warehouseAuth = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'warehouse')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Warehouse access required'
    });
  }
};

// Delivery authorization (admin and delivery staff)
const deliveryAuth = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'delivery')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Delivery access required'
    });
  }
};

// Staff authorization (admin, warehouse, delivery, support)
const staffAuth = (req, res, next) => {
  const staffRoles = ['admin', 'warehouse', 'delivery', 'support'];
  if (req.user && staffRoles.includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Staff access required'
    });
  }
};

// Optional authentication - doesn't fail if no token provided
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
    }
    // Continue regardless of whether token exists or is valid
    next();
  } catch (error) {
    // Even if token is invalid, continue without user
    next();
  }
};

// Generic authorization middleware that accepts multiple roles
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

module.exports = { 
  auth, 
  authenticate: auth, // Alias for consistency
  optionalAuth,
  authorize,
  adminAuth, 
  warehouseAuth, 
  deliveryAuth, 
  staffAuth 
};
