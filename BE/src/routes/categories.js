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
const {
  validateCategoryCreate,
  validateCategoryUpdate,
  validateCategoryId,
  validateSEOData
} = require('../middlewares/categoryValidation');

const router = express.Router();

// Public routes
router.get('/', getCategories);                 // Get all categories
router.get('/hierarchy', getCategoryHierarchy); // Get category hierarchy
router.get('/:id', validateCategoryId, getCategory); // Get single category

// Admin routes
router.post('/', 
  auth, 
  adminAuth, 
  validateCategoryCreate, 
  validateSEOData, 
  createCategory
); // Create category

router.put('/:id', 
  auth, 
  adminAuth, 
  validateCategoryId,
  validateCategoryUpdate, 
  validateSEOData, 
  updateCategory
); // Update category

router.delete('/:id', 
  auth, 
  adminAuth, 
  validateCategoryId, 
  deleteCategory
); // Delete category

module.exports = router;
