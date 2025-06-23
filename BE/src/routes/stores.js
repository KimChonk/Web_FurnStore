const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authenticate, authorize } = require('../middlewares/auth');
const {
  validateStoreCreate,
  validateStoreUpdate,
  validateStoreId,
  validateStoreStaffManagement,
  validateNearbySearch,
  validateRevenueQuery
} = require('../middlewares/storeValidation');

// @route   GET /api/stores
// @desc    Get all stores with pagination and filtering
// @access  Public (for basic info) / Private (for detailed info)
router.get('/', storeController.getAllStores);

// @route   GET /api/stores/nearby
// @desc    Find nearby stores based on coordinates
// @access  Public
router.get('/nearby', validateNearbySearch, storeController.findNearbyStores);

// @route   GET /api/stores/statistics
// @desc    Get store statistics and analytics
// @access  Private (Admin/Manager only)
router.get('/statistics', 
  authenticate, 
  authorize(['admin', 'manager']), 
  storeController.getStoreStatistics
);

// @route   GET /api/stores/:id
// @desc    Get store by ID
// @access  Public (basic info) / Private (detailed info)
router.get('/:id', validateStoreId, storeController.getStoreById);

// @route   GET /api/stores/:id/revenue
// @desc    Get store revenue data
// @access  Private (Admin/Manager only)
router.get('/:id/revenue', 
  authenticate, 
  authorize(['admin', 'manager']), 
  validateStoreId,
  validateRevenueQuery,
  storeController.getStoreRevenue
);

// @route   GET /api/stores/:id/staff
// @desc    Get store staff list
// @access  Private (Admin/Manager only)
router.get('/:id/staff', 
  authenticate, 
  authorize(['admin', 'manager']), 
  validateStoreId,
  storeController.getStoreStaff
);

// @route   GET /api/stores/:id/inventory
// @desc    Get store inventory overview
// @access  Private (Admin/Manager/Staff only)
router.get('/:id/inventory', 
  authenticate, 
  authorize(['admin', 'manager', 'staff']), 
  validateStoreId,
  storeController.getStoreInventory
);

// @route   GET /api/stores/:id/performance
// @desc    Get store performance metrics
// @access  Private (Admin/Manager only)
router.get('/:id/performance', 
  authenticate, 
  authorize(['admin', 'manager']), 
  validateStoreId,
  storeController.getStorePerformance
);

// @route   POST /api/stores
// @desc    Create a new store
// @access  Private (Admin only)
router.post('/', 
  authenticate, 
  authorize(['admin']), 
  validateStoreCreate,
  storeController.createStore
);

// @route   POST /api/stores/:id/staff
// @desc    Manage store staff (add/remove/update)
// @access  Private (Admin/Manager only)
router.post('/:id/staff', 
  authenticate, 
  authorize(['admin', 'manager']), 
  validateStoreId,
  validateStoreStaffManagement,
  storeController.manageStoreStaff
);

// @route   PUT /api/stores/:id
// @desc    Update store information
// @access  Private (Admin/Manager only)
router.put('/:id', 
  authenticate, 
  authorize(['admin', 'manager']), 
  validateStoreId,
  validateStoreUpdate,
  storeController.updateStore
);

// @route   PATCH /api/stores/:id/status
// @desc    Update store status
// @access  Private (Admin only)
router.patch('/:id/status', 
  authenticate, 
  authorize(['admin']), 
  validateStoreId,
  storeController.updateStoreStatus
);

// @route   DELETE /api/stores/:id
// @desc    Delete a store (soft delete)
// @access  Private (Admin only)
router.delete('/:id', 
  authenticate, 
  authorize(['admin']), 
  validateStoreId,
  storeController.deleteStore
);

module.exports = router;
