const express = require('express');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryHierarchy
} = require('../controllers/categoryController');

const { auth, adminAuth } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.get('/', getCategories);                 // Get all categories
router.get('/hierarchy', getCategoryHierarchy); // Get category hierarchy
router.get('/:id', getCategory);               // Get single category

// Admin routes
router.post('/', auth, adminAuth, createCategory);       // Create category
router.put('/:id', auth, adminAuth, updateCategory);     // Update category
router.delete('/:id', auth, adminAuth, deleteCategory);  // Delete category

module.exports = router;
