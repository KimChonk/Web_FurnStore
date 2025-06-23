const mongoose = require('mongoose');

const validateOrderCreate = (req, res, next) => {
  const { orderItems, shippingAddress, paymentMethod, taxPrice, shippingPrice } = req.body;
  const errors = [];

  // Validate order items
  if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
    errors.push('Order items are required and must be a non-empty array');
  } else {
    orderItems.forEach((item, index) => {
      // Validate product ID
      if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
        errors.push(`Invalid product ID at item ${index + 1}`);
      }

      // Validate quantity
      if (!item.quantity || !Number.isInteger(item.quantity) || item.quantity < 1) {
        errors.push(`Quantity must be a positive integer at item ${index + 1}`);
      }

      // Validate quantity limit (max 100 per item)
      if (item.quantity && item.quantity > 100) {
        errors.push(`Quantity cannot exceed 100 per item at item ${index + 1}`);
      }
    });
  }

  // Validate shipping address
  if (!shippingAddress || typeof shippingAddress !== 'object') {
    errors.push('Shipping address is required');
  } else {
    const requiredAddressFields = ['fullName', 'address', 'city', 'phone'];
    requiredAddressFields.forEach(field => {
      if (!shippingAddress[field] || shippingAddress[field].trim().length === 0) {
        errors.push(`Shipping address ${field} is required`);
      }
    });

    // Validate phone number format (Vietnamese format)
    if (shippingAddress.phone && !/^[0-9+\-\s()]{10,15}$/.test(shippingAddress.phone)) {
      errors.push('Invalid phone number format');
    }

    // Validate postal code (if provided)
    if (shippingAddress.postalCode && !/^[0-9]{5,6}$/.test(shippingAddress.postalCode)) {
      errors.push('Invalid postal code format');
    }
  }

  // Validate payment method
  const validPaymentMethods = ['cash_on_delivery', 'bank_transfer', 'credit_card', 'e_wallet'];
  if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
    errors.push(`Payment method must be one of: ${validPaymentMethods.join(', ')}`);
  }

  // Validate tax price
  if (taxPrice !== undefined && (typeof taxPrice !== 'number' || taxPrice < 0)) {
    errors.push('Tax price must be a non-negative number');
  }

  // Validate shipping price
  if (shippingPrice !== undefined && (typeof shippingPrice !== 'number' || shippingPrice < 0)) {
    errors.push('Shipping price must be a non-negative number');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Order validation errors',
      errors
    });
  }

  next();
};

const validateOrderStatusUpdate = (req, res, next) => {
  const { status, notes } = req.body;
  const errors = [];

  // Validate status
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!status || !validStatuses.includes(status)) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  // Validate notes length
  if (notes && notes.length > 500) {
    errors.push('Notes cannot exceed 500 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Status update validation errors',
      errors
    });
  }

  next();
};

const validateOrderId = (req, res, next) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid order ID format'
    });
  }

  next();
};

const validateDeliveryAssignment = (req, res, next) => {
  const { deliveryPersonId } = req.body;
  const errors = [];

  // Validate delivery person ID
  if (!deliveryPersonId || !mongoose.Types.ObjectId.isValid(deliveryPersonId)) {
    errors.push('Valid delivery person ID is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Delivery assignment validation errors',
      errors
    });
  }

  next();
};

const validatePaymentResult = (req, res, next) => {
  const { paymentResult } = req.body;
  const errors = [];

  if (!paymentResult || typeof paymentResult !== 'object') {
    errors.push('Payment result is required');
  } else {
    // Validate required payment result fields
    if (!paymentResult.id) {
      errors.push('Payment result ID is required');
    }

    if (!paymentResult.status) {
      errors.push('Payment result status is required');
    }

    // Validate payment status values
    const validPaymentStatuses = ['completed', 'pending', 'failed'];
    if (paymentResult.status && !validPaymentStatuses.includes(paymentResult.status)) {
      errors.push(`Payment status must be one of: ${validPaymentStatuses.join(', ')}`);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Payment validation errors',
      errors
    });
  }

  next();
};

const validateOrderQuery = (req, res, next) => {
  const { page, limit, startDate, endDate, isPaid, isDelivered } = req.query;
  const errors = [];

  // Validate pagination
  if (page && (!Number.isInteger(parseInt(page)) || parseInt(page) < 1)) {
    errors.push('Page must be a positive integer');
  }

  if (limit && (!Number.isInteger(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    errors.push('Limit must be a positive integer between 1 and 100');
  }

  // Validate date range
  if (startDate && isNaN(Date.parse(startDate))) {
    errors.push('Invalid start date format');
  }

  if (endDate && isNaN(Date.parse(endDate))) {
    errors.push('Invalid end date format');
  }

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    errors.push('Start date cannot be after end date');
  }

  // Validate boolean fields
  if (isPaid && !['true', 'false'].includes(isPaid)) {
    errors.push('isPaid must be true or false');
  }

  if (isDelivered && !['true', 'false'].includes(isDelivered)) {
    errors.push('isDelivered must be true or false');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Query validation errors',
      errors
    });
  }

  next();
};

const validateOrderTracking = (req, res, next) => {
  const { tracking } = req.body;
  const errors = [];

  if (tracking) {
    // Validate tracking number
    if (tracking.trackingNumber && !/^[A-Z0-9]{8,20}$/.test(tracking.trackingNumber)) {
      errors.push('Invalid tracking number format (8-20 alphanumeric characters)');
    }

    // Validate carrier
    if (tracking.carrier && tracking.carrier.length > 50) {
      errors.push('Carrier name cannot exceed 50 characters');
    }

    // Validate tracking URL
    if (tracking.trackingUrl) {
      try {
        new URL(tracking.trackingUrl);
      } catch (e) {
        errors.push('Invalid tracking URL format');
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Tracking validation errors',
      errors
    });
  }

  next();
};

module.exports = {
  validateOrderCreate,
  validateOrderStatusUpdate,
  validateOrderId,
  validateDeliveryAssignment,
  validatePaymentResult,
  validateOrderQuery,
  validateOrderTracking
};
