const express = require('express');
const { auth, adminAuth } = require('../middlewares/auth');

const router = express.Router();

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Products endpoint - Coming soon',
    data: []
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
router.get('/featured', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Featured products endpoint - Coming soon',
    data: []
  });
});

// @desc    Get best selling products
// @route   GET /api/products/bestselling
// @access  Public
router.get('/bestselling', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Best selling products endpoint - Coming soon',
    data: []
  });
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
router.get('/search', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Product search endpoint - Coming soon',
    data: []
  });
});

module.exports = router;
