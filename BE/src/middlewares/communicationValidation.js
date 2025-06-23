const mongoose = require('mongoose');

const validateCommunicationLog = (req, res, next) => {
  const { type, method, message, duration, outcome, followUpRequired, followUpDate } = req.body;
  const errors = [];

  // Validate communication type
  const validTypes = ['call', 'sms', 'email', 'chat', 'whatsapp'];
  if (!type || !validTypes.includes(type)) {
    errors.push(`Communication type must be one of: ${validTypes.join(', ')}`);
  }

  // Validate method
  const validMethods = ['outgoing', 'incoming'];
  if (!method || !validMethods.includes(method)) {
    errors.push(`Method must be one of: ${validMethods.join(', ')}`);
  }

  // Validate message
  if (!message || message.trim().length === 0) {
    errors.push('Message is required');
  }

  if (message && message.length > 1000) {
    errors.push('Message cannot exceed 1000 characters');
  }

  // Validate duration for calls
  if (type === 'call' && duration !== undefined) {
    if (!Number.isInteger(duration) || duration < 0) {
      errors.push('Call duration must be a non-negative integer (in seconds)');
    }
    if (duration > 7200) { // 2 hours max
      errors.push('Call duration cannot exceed 7200 seconds (2 hours)');
    }
  }

  // Validate outcome
  const validOutcomes = [
    'connected', 'no_answer', 'busy', 'voicemail', 'delivered', 
    'failed', 'read', 'sent', 'initiated', 'completed'
  ];
  if (!outcome || !validOutcomes.includes(outcome)) {
    errors.push(`Outcome must be one of: ${validOutcomes.join(', ')}`);
  }

  // Validate follow up fields
  if (followUpRequired !== undefined && typeof followUpRequired !== 'boolean') {
    errors.push('Follow up required must be a boolean value');
  }

  if (followUpRequired && followUpDate) {
    if (isNaN(Date.parse(followUpDate))) {
      errors.push('Invalid follow up date format');
    }
    if (new Date(followUpDate) <= new Date()) {
      errors.push('Follow up date must be in the future');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Communication log validation errors',
      errors
    });
  }

  next();
};

const validateCallInitiation = (req, res, next) => {
  const { phoneType, reason } = req.body;
  const errors = [];

  // Validate phone type
  const validPhoneTypes = ['primary', 'alternate', 'shipping'];
  if (phoneType && !validPhoneTypes.includes(phoneType)) {
    errors.push(`Phone type must be one of: ${validPhoneTypes.join(', ')}`);
  }

  // Validate reason
  if (reason && reason.length > 200) {
    errors.push('Call reason cannot exceed 200 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Call initiation validation errors',
      errors
    });
  }

  next();
};

const validateSMSRequest = (req, res, next) => {
  const { message, phoneType, template } = req.body;
  const errors = [];

  // Validate message (required if no template)
  if (!template && (!message || message.trim().length === 0)) {
    errors.push('Message is required when not using a template');
  }

  if (message && message.length > 160) {
    errors.push('SMS message cannot exceed 160 characters');
  }

  // Validate phone type
  const validPhoneTypes = ['primary', 'alternate', 'shipping'];
  if (phoneType && !validPhoneTypes.includes(phoneType)) {
    errors.push(`Phone type must be one of: ${validPhoneTypes.join(', ')}`);
  }

  // Validate template
  if (template) {
    const validTemplates = [
      'on_the_way', 'arrival_soon', 'failed_delivery', 
      'delivery_complete', 'contact_request', 'address_verification', 
      'schedule_delivery'
    ];
    if (!validTemplates.includes(template)) {
      errors.push(`Template must be one of: ${validTemplates.join(', ')}`);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'SMS validation errors',
      errors
    });
  }

  next();
};

const validateCommunicationQuery = (req, res, next) => {
  const { limit, type, includeNavigation } = req.query;
  const errors = [];

  // Validate limit
  if (limit && (!Number.isInteger(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    errors.push('Limit must be a positive integer between 1 and 100');
  }

  // Validate type filter
  if (type) {
    const validTypes = ['call', 'sms', 'email', 'chat', 'whatsapp'];
    if (!validTypes.includes(type)) {
      errors.push(`Type must be one of: ${validTypes.join(', ')}`);
    }
  }

  // Validate includeNavigation
  if (includeNavigation && !['true', 'false'].includes(includeNavigation)) {
    errors.push('Include navigation must be true or false');
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

// Middleware to check if phone number is valid Vietnamese format
const validateVietnamesePhone = (phoneNumber) => {
  // Vietnamese phone number patterns
  const patterns = [
    /^(\+84|84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-4|6-9])[0-9]{7}$/, // Mobile
    /^(\+84|84|0)(2[0-9])[0-9]{8}$/ // Landline
  ];
  
  return patterns.some(pattern => pattern.test(phoneNumber));
};

const validatePhoneNumber = (req, res, next) => {
  const { phoneNumber } = req.body;
  
  if (phoneNumber && !validateVietnamesePhone(phoneNumber)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Vietnamese phone number format'
    });
  }

  next();
};

// Rate limiting for communication actions
const communicationRateLimit = (req, res, next) => {
  // This would typically use Redis or similar for production
  // For now, we'll add a simple in-memory rate limit check
  
  const userId = req.user._id.toString();
  const currentTime = Date.now();
  const timeWindow = 60 * 1000; // 1 minute
  const maxRequests = 10; // Max 10 communications per minute
  
  // In production, store this in Redis with TTL
  if (!global.communicationRateLimit) {
    global.communicationRateLimit = {};
  }
  
  if (!global.communicationRateLimit[userId]) {
    global.communicationRateLimit[userId] = [];
  }
  
  // Clean old entries
  global.communicationRateLimit[userId] = global.communicationRateLimit[userId]
    .filter(timestamp => currentTime - timestamp < timeWindow);
  
  // Check if limit exceeded
  if (global.communicationRateLimit[userId].length >= maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'Communication rate limit exceeded. Please wait before making more requests.'
    });
  }
  
  // Add current request
  global.communicationRateLimit[userId].push(currentTime);
  
  next();
};

module.exports = {
  validateCommunicationLog,
  validateCallInitiation,
  validateSMSRequest,
  validateCommunicationQuery,
  validateOrderId,
  validatePhoneNumber,
  communicationRateLimit
};
