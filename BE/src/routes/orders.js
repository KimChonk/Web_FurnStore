const express = require('express');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
router.get('/', auth, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Orders endpoint - Coming soon',
    data: []
  });
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', auth, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Create order endpoint - Coming soon',
    data: {}
  });
});

module.exports = router;
