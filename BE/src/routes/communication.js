const express = require('express');
const {
  getCustomerContactInfo,
  getDeliveryAddress,
  logCommunication,
  initiateCall,
  sendSMS,
  getCommunicationHistory,
  getSMSTemplates
} = require('../controllers/communicationController');

const { auth, adminAuth, deliveryAuth, staffAuth } = require('../middlewares/auth');
const {
  validateCommunicationLog,
  validateCallInitiation,
  validateSMSRequest,
  validateCommunicationQuery,
  validateOrderId,
  validatePhoneNumber,
  communicationRateLimit
} = require('../middlewares/communicationValidation');

const router = express.Router();

// Customer Contact Information Routes
router.get('/order/:orderId/contact', 
  auth, 
  staffAuth,
  validateOrderId,
  getCustomerContactInfo
); // Get customer contact info for order

router.get('/order/:orderId/address', 
  auth, 
  staffAuth,
  validateOrderId,
  validateCommunicationQuery,
  getDeliveryAddress
); // Get delivery address with navigation

// Communication Logging Routes
router.post('/order/:orderId/log', 
  auth, 
  staffAuth,
  validateOrderId,
  validateCommunicationLog,
  communicationRateLimit,
  logCommunication
); // Log communication with customer

router.get('/order/:orderId/history', 
  auth, 
  staffAuth,
  validateOrderId,
  validateCommunicationQuery,
  getCommunicationHistory
); // Get communication history for order

// Call Integration Routes
router.post('/order/:orderId/call', 
  auth, 
  staffAuth,
  validateOrderId,
  validateCallInitiation,
  communicationRateLimit,
  initiateCall
); // Initiate call to customer

// SMS Integration Routes
router.post('/order/:orderId/sms', 
  auth, 
  staffAuth,
  validateOrderId,
  validateSMSRequest,
  communicationRateLimit,
  sendSMS
); // Send SMS to customer

router.get('/sms-templates', 
  auth, 
  staffAuth,
  getSMSTemplates
); // Get available SMS templates

module.exports = router;
