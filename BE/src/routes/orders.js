const express = require('express');
const {
  createOrder,
  getOrders,
  getOrder,
  getMyOrders,
  updateOrderStatus,
  assignDeliveryPerson,
  markOrderAsPaid,
  getWarehouseOrders,
  getOrderStats,
  updateOrderTracking,
  generateOrderSlip
} = require('../controllers/orderController');

const { auth, adminAuth, warehouseAuth, deliveryAuth } = require('../middlewares/auth');
const {
  validateOrderCreate,
  validateOrderStatusUpdate,
  validateOrderId,
  validateDeliveryAssignment,
  validatePaymentResult,
  validateOrderQuery,
  validateOrderTracking
} = require('../middlewares/orderValidation');

const router = express.Router();

// Customer routes
router.post('/', 
  auth, 
  validateOrderCreate, 
  createOrder
); // Create new order

router.get('/my-orders', 
  auth, 
  validateOrderQuery, 
  getMyOrders
); // Get user's orders

// Admin/Staff routes
router.get('/', 
  auth, 
  adminAuth, 
  validateOrderQuery, 
  getOrders
); // Get all orders (Admin only)

router.get('/warehouse', 
  auth, 
  warehouseAuth, 
  validateOrderQuery, 
  getWarehouseOrders
); // Get orders for warehouse

router.get('/stats', 
  auth, 
  adminAuth, 
  getOrderStats
); // Get order statistics

router.get('/:id', 
  auth, 
  validateOrderId, 
  getOrder
); // Get order by ID

// Order management routes
router.put('/:id/status', 
  auth, 
  warehouseAuth, 
  validateOrderId, 
  validateOrderStatusUpdate, 
  updateOrderStatus
); // Update order status

router.put('/:id/assign-delivery', 
  auth, 
  adminAuth, 
  validateOrderId, 
  validateDeliveryAssignment, 
  assignDeliveryPerson
); // Assign delivery person

router.put('/:id/pay', 
  auth, 
  adminAuth, 
  validateOrderId, 
  validatePaymentResult, 
  markOrderAsPaid
); // Mark order as paid

router.put('/:id/tracking', 
  auth, 
  warehouseAuth, 
  validateOrderId, 
  validateOrderTracking, 
  updateOrderTracking
); // Update tracking information

router.get('/:id/slip', 
  auth, 
  warehouseAuth, 
  validateOrderId, 
  generateOrderSlip
); // Generate order slip for printing

module.exports = router;
