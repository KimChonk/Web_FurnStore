const express = require('express');
const {
  getProducts,
  getFeaturedProducts,
  getBestSellingProducts,
  getNewProducts,
  searchProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductInventory,
  getProductCategories
} = require('../controllers/productController');

const { auth, adminAuth } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.get('/', getProducts);                    // Get all products with filters
router.get('/featured', getFeaturedProducts);   // Get featured products
router.get('/bestselling', getBestSellingProducts); // Get best selling products
router.get('/new', getNewProducts);             // Get new products
router.get('/search', searchProducts);          // Search products by name
router.get('/categories', getProductCategories); // Get product categories
router.get('/:id', getProduct);                 // Get single product by ID or slug

// Admin routes
router.post('/', auth, adminAuth, createProduct);                    // Create product
router.put('/:id', auth, adminAuth, updateProduct);                 // Update product
router.delete('/:id', auth, adminAuth, deleteProduct);              // Delete product

// Admin/Warehouse routes
router.put('/:id/inventory', auth, updateProductInventory);         // Update inventory

module.exports = router;
