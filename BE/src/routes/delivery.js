const express = require('express');
const {
  getMyDeliveryAssignments,
  getAvailableForDelivery,
  updateDeliveryStatus,
  confirmDeliverySuccess,
  reportDeliveryFailure,
  getDeliveryHistory,
  reportEmergencyIncident,
  uploadDeliveryPhotos,
  bulkAssignDelivery
} = require('../controllers/deliveryController');

const { auth, adminAuth, deliveryAuth, staffAuth } = require('../middlewares/auth');
const {
  validateDeliveryStatusUpdate,
  validateDeliveryConfirmation,
  validateDeliveryFailureReport,
  validateEmergencyIncident,
  validateBulkAssignment,
  validateDeliveryQuery,
  validateOrderId
} = require('../middlewares/deliveryValidation');

const upload = require('../middlewares/upload');

const router = express.Router();

// Delivery Person Routes
router.get('/assignments', 
  auth, 
  deliveryAuth,
  validateDeliveryQuery,
  getMyDeliveryAssignments
); // Get my delivery assignments

router.get('/history', 
  auth, 
  deliveryAuth,
  validateDeliveryQuery,
  getDeliveryHistory
); // Get delivery history

router.put('/:orderId/status', 
  auth, 
  deliveryAuth,
  validateOrderId,
  validateDeliveryStatusUpdate,
  updateDeliveryStatus
); // Update delivery status

router.post('/:orderId/confirm', 
  auth, 
  deliveryAuth,
  validateOrderId,
  validateDeliveryConfirmation,
  confirmDeliverySuccess
); // Confirm successful delivery

router.post('/:orderId/failure', 
  auth, 
  deliveryAuth,
  validateOrderId,
  validateDeliveryFailureReport,
  reportDeliveryFailure
); // Report delivery failure

router.post('/:orderId/photos', 
  auth, 
  deliveryAuth,
  validateOrderId,
  upload.uploadDeliveryPhotos,
  uploadDeliveryPhotos
); // Upload delivery proof photos

router.post('/incident', 
  auth, 
  deliveryAuth,
  validateEmergencyIncident,
  reportEmergencyIncident
); // Report emergency incident

// Admin/Management Routes
router.get('/available', 
  auth, 
  adminAuth,
  validateDeliveryQuery,
  getAvailableForDelivery
); // Get orders available for delivery assignment

router.post('/bulk-assign', 
  auth, 
  adminAuth,
  validateBulkAssignment,
  bulkAssignDelivery
); // Bulk assign orders to delivery person

module.exports = router;
