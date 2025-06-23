const express = require('express');
const {
  getUserProfile,
  updateUserProfile,
  getCustomerHistory,
  getCustomerStatistics,
  getAllUsers,
  getUserById,
  createStaffAccount,
  updateUserById,
  deleteUserById
} = require('../controllers/userController');

const { auth, adminAuth } = require('../middlewares/auth');
const {
  validateCreateStaff,
  validateUpdateUser,
  validateProfileUpdate,
  validateQueryParams,
  requireCustomerRole
} = require('../middlewares/userValidation');

const router = express.Router();

// User profile routes (authenticated users)
router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, validateProfileUpdate, updateUserProfile);

// Customer history routes (customers only)
router.get('/history', auth, requireCustomerRole, validateQueryParams, getCustomerHistory);
router.get('/statistics', auth, requireCustomerRole, getCustomerStatistics);

// Admin routes for user management
router.get('/', auth, adminAuth, validateQueryParams, getAllUsers);
router.get('/:id', auth, adminAuth, getUserById);
router.post('/staff', auth, adminAuth, validateCreateStaff, createStaffAccount);
router.put('/:id', auth, adminAuth, validateUpdateUser, updateUserById);
router.delete('/:id', auth, adminAuth, deleteUserById);

module.exports = router;
