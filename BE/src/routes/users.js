const express = require('express');
const { auth, adminAuth } = require('../middlewares/auth');

const router = express.Router();

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', auth, adminAuth, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Users management endpoint - Coming soon',
    data: []
  });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', auth, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User profile endpoint - Coming soon',
    data: req.user
  });
});

module.exports = router;
