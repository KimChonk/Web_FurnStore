const mongoose = require('mongoose');

const validateDeliveryStatusUpdate = (req, res, next) => {
  const { status, notes, deliveryAttempts, failureReason, estimatedRetry } = req.body;
  const errors = [];

  // Validate status
  const validDeliveryStatuses = [
    'shipped', 
    'out_for_delivery', 
    'delivery_attempted', 
    'delivered', 
    'delivery_failed',
    'delivery_refused',
    'address_verification_needed'
  ];
  
  if (!status || !validDeliveryStatuses.includes(status)) {
    errors.push(`Status must be one of: ${validDeliveryStatuses.join(', ')}`);
  }

  // Validate notes length
  if (notes && notes.length > 1000) {
    errors.push('Notes cannot exceed 1000 characters');
  }

  // Validate delivery attempts
  if (deliveryAttempts !== undefined && (!Number.isInteger(deliveryAttempts) || deliveryAttempts < 0)) {
    errors.push('Delivery attempts must be a non-negative integer');
  }

  // Validate failure reason if status is failed
  if (status === 'delivery_failed' && (!failureReason || failureReason.trim().length === 0)) {
    errors.push('Failure reason is required when status is delivery_failed');
  }

  // Validate estimated retry date
  if (estimatedRetry && isNaN(Date.parse(estimatedRetry))) {
    errors.push('Invalid estimated retry date format');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Delivery status validation errors',
      errors
    });
  }

  next();
};

const validateDeliveryConfirmation = (req, res, next) => {
  const { receiverName, receiverPhone, deliveryNotes, signatureRequired, proofPhotos } = req.body;
  const errors = [];

  // Validate receiver name
  if (!receiverName || receiverName.trim().length === 0) {
    errors.push('Receiver name is required');
  }

  if (receiverName && receiverName.length > 100) {
    errors.push('Receiver name cannot exceed 100 characters');
  }

  // Validate receiver phone (if provided)
  if (receiverPhone && !/^[0-9+\-\s()]{10,15}$/.test(receiverPhone)) {
    errors.push('Invalid receiver phone number format');
  }

  // Validate delivery notes length
  if (deliveryNotes && deliveryNotes.length > 500) {
    errors.push('Delivery notes cannot exceed 500 characters');
  }

  // Validate signature required
  if (signatureRequired !== undefined && typeof signatureRequired !== 'boolean') {
    errors.push('Signature required must be a boolean value');
  }

  // Validate proof photos array
  if (proofPhotos && !Array.isArray(proofPhotos)) {
    errors.push('Proof photos must be an array');
  }

  if (proofPhotos && proofPhotos.length > 10) {
    errors.push('Cannot upload more than 10 proof photos');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Delivery confirmation validation errors',
      errors
    });
  }

  next();
};

const validateDeliveryFailureReport = (req, res, next) => {
  const {
    failureReason,
    failureDetails,
    customerNotAvailable,
    incorrectAddress,
    refusedDelivery,
    estimatedRetry,
    requiresAction
  } = req.body;
  const errors = [];

  // Validate failure reason
  const validFailureReasons = [
    'customer_not_available',
    'incorrect_address',
    'refused_delivery',
    'access_denied',
    'weather_conditions',
    'vehicle_breakdown',
    'security_concerns',
    'other'
  ];

  if (!failureReason || !validFailureReasons.includes(failureReason)) {
    errors.push(`Failure reason must be one of: ${validFailureReasons.join(', ')}`);
  }

  // Validate failure details
  if (!failureDetails || failureDetails.trim().length === 0) {
    errors.push('Failure details are required');
  }

  if (failureDetails && failureDetails.length > 1000) {
    errors.push('Failure details cannot exceed 1000 characters');
  }

  // Validate boolean fields
  if (customerNotAvailable !== undefined && typeof customerNotAvailable !== 'boolean') {
    errors.push('Customer not available must be a boolean value');
  }

  if (incorrectAddress !== undefined && typeof incorrectAddress !== 'boolean') {
    errors.push('Incorrect address must be a boolean value');
  }

  if (refusedDelivery !== undefined && typeof refusedDelivery !== 'boolean') {
    errors.push('Refused delivery must be a boolean value');
  }

  if (requiresAction !== undefined && typeof requiresAction !== 'boolean') {
    errors.push('Requires action must be a boolean value');
  }

  // Validate estimated retry date
  if (estimatedRetry && isNaN(Date.parse(estimatedRetry))) {
    errors.push('Invalid estimated retry date format');
  }

  // Ensure estimated retry is in the future
  if (estimatedRetry && new Date(estimatedRetry) <= new Date()) {
    errors.push('Estimated retry date must be in the future');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Delivery failure report validation errors',
      errors
    });
  }

  next();
};

const validateEmergencyIncident = (req, res, next) => {
  const {
    incidentType,
    description,
    location,
    severity,
    requiresImmediateResponse,
    affectedOrderIds,
    contactNumber
  } = req.body;
  const errors = [];

  // Validate incident type
  const validIncidentTypes = [
    'accident',
    'vehicle_breakdown',
    'theft',
    'security_threat',
    'natural_disaster',
    'medical_emergency',
    'customer_complaint',
    'delivery_dispute',
    'other'
  ];

  if (!incidentType || !validIncidentTypes.includes(incidentType)) {
    errors.push(`Incident type must be one of: ${validIncidentTypes.join(', ')}`);
  }

  // Validate description
  if (!description || description.trim().length === 0) {
    errors.push('Incident description is required');
  }

  if (description && description.length > 2000) {
    errors.push('Incident description cannot exceed 2000 characters');
  }

  // Validate location
  if (location && location.length > 500) {
    errors.push('Location cannot exceed 500 characters');
  }

  // Validate severity
  const validSeverities = ['low', 'medium', 'high', 'critical'];
  if (!severity || !validSeverities.includes(severity)) {
    errors.push(`Severity must be one of: ${validSeverities.join(', ')}`);
  }

  // Validate boolean fields
  if (requiresImmediateResponse !== undefined && typeof requiresImmediateResponse !== 'boolean') {
    errors.push('Requires immediate response must be a boolean value');
  }

  // Validate affected order IDs
  if (affectedOrderIds && !Array.isArray(affectedOrderIds)) {
    errors.push('Affected order IDs must be an array');
  }

  if (affectedOrderIds && affectedOrderIds.length > 0) {
    affectedOrderIds.forEach((orderId, index) => {
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        errors.push(`Invalid order ID at index ${index}`);
      }
    });
  }

  // Validate contact number
  if (contactNumber && !/^[0-9+\-\s()]{10,15}$/.test(contactNumber)) {
    errors.push('Invalid contact number format');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Emergency incident validation errors',
      errors
    });
  }

  next();
};

const validateBulkAssignment = (req, res, next) => {
  const { orderIds, deliveryPersonId } = req.body;
  const errors = [];

  // Validate order IDs
  if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
    errors.push('Order IDs are required and must be a non-empty array');
  }

  if (orderIds && orderIds.length > 50) {
    errors.push('Cannot assign more than 50 orders at once');
  }

  if (orderIds && orderIds.length > 0) {
    orderIds.forEach((orderId, index) => {
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        errors.push(`Invalid order ID at index ${index}`);
      }
    });
  }

  // Validate delivery person ID
  if (!deliveryPersonId || !mongoose.Types.ObjectId.isValid(deliveryPersonId)) {
    errors.push('Valid delivery person ID is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Bulk assignment validation errors',
      errors
    });
  }

  next();
};

const validateDeliveryQuery = (req, res, next) => {
  const { page, limit, startDate, endDate, status, city, urgency, includeFailures } = req.query;
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

  // Validate status
  if (status) {
    const validStatuses = [
      'shipped', 
      'out_for_delivery', 
      'delivered', 
      'delivery_failed', 
      'delivery_refused'
    ];
    if (!validStatuses.includes(status)) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }
  }

  // Validate city
  if (city && city.length > 100) {
    errors.push('City name cannot exceed 100 characters');
  }

  // Validate urgency
  if (urgency && !['urgent', 'normal'].includes(urgency)) {
    errors.push('Urgency must be either urgent or normal');
  }

  // Validate boolean fields
  if (includeFailures && !['true', 'false'].includes(includeFailures)) {
    errors.push('Include failures must be true or false');
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

const validateOrderId = (req, res, next) => {
  const { orderId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid order ID format'
    });
  }

  next();
};

module.exports = {
  validateDeliveryStatusUpdate,
  validateDeliveryConfirmation,
  validateDeliveryFailureReport,
  validateEmergencyIncident,
  validateBulkAssignment,
  validateDeliveryQuery,
  validateOrderId
};
