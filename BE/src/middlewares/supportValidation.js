const mongoose = require('mongoose');

const validateTicketCreate = (req, res, next) => {
  const { subject, description, category, priority, contactMethod, customerInfo } = req.body;
  const errors = [];

  // Check required fields
  if (!subject || subject.trim().length === 0) {
    errors.push('Subject is required');
  }

  if (!description || description.trim().length === 0) {
    errors.push('Description is required');
  }

  if (!category || category.trim().length === 0) {
    errors.push('Category is required');
  }

  // Validate subject length
  if (subject && subject.trim().length > 200) {
    errors.push('Subject cannot exceed 200 characters');
  }

  // Validate description length
  if (description && description.trim().length > 5000) {
    errors.push('Description cannot exceed 5000 characters');
  }

  // Validate category
  const validCategories = ['technical', 'billing', 'product', 'delivery', 'general', 'complaint'];
  if (category && !validCategories.includes(category)) {
    errors.push(`Category must be one of: ${validCategories.join(', ')}`);
  }

  // Validate priority
  const validPriorities = ['low', 'medium', 'high', 'urgent', 'emergency'];
  if (priority && !validPriorities.includes(priority)) {
    errors.push(`Priority must be one of: ${validPriorities.join(', ')}`);
  }

  // Validate contact method
  const validContactMethods = ['email', 'phone', 'chat', 'in_person'];
  if (contactMethod && !validContactMethods.includes(contactMethod)) {
    errors.push(`Contact method must be one of: ${validContactMethods.join(', ')}`);
  }

  // Validate customer info for guest users
  if (customerInfo && !req.user) {
    if (!customerInfo.name || customerInfo.name.trim().length === 0) {
      errors.push('Customer name is required for guest tickets');
    }
    if (!customerInfo.email || customerInfo.email.trim().length === 0) {
      errors.push('Customer email is required for guest tickets');
    }
    if (customerInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      errors.push('Invalid email format');
    }
    if (customerInfo.phone && !/^[\+]?[0-9\s\-\(\)]{8,15}$/.test(customerInfo.phone)) {
      errors.push('Invalid phone number format');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors
    });
  }

  next();
};

const validateTicketUpdate = (req, res, next) => {
  const { subject, description, status, priority, assignedTo } = req.body;
  const errors = [];

  // Validate subject if provided
  if (subject !== undefined) {
    if (!subject || subject.trim().length === 0) {
      errors.push('Subject cannot be empty');
    }
    if (subject && subject.trim().length > 200) {
      errors.push('Subject cannot exceed 200 characters');
    }
  }

  // Validate description if provided
  if (description !== undefined) {
    if (!description || description.trim().length === 0) {
      errors.push('Description cannot be empty');
    }
    if (description && description.trim().length > 5000) {
      errors.push('Description cannot exceed 5000 characters');
    }
  }

  // Validate status
  const validStatuses = ['open', 'assigned', 'in_progress', 'waiting_for_customer', 'escalated', 'resolved', 'closed'];
  if (status && !validStatuses.includes(status)) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  // Validate priority
  const validPriorities = ['low', 'medium', 'high', 'urgent', 'emergency'];
  if (priority && !validPriorities.includes(priority)) {
    errors.push(`Priority must be one of: ${validPriorities.join(', ')}`);
  }

  // Validate assigned user ID
  if (assignedTo !== undefined && assignedTo && !mongoose.Types.ObjectId.isValid(assignedTo)) {
    errors.push('Invalid assigned user ID format');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors
    });
  }

  next();
};

const validateTicketId = (req, res, next) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ticket ID format'
    });
  }

  next();
};

const validateTicketResponse = (req, res, next) => {
  const { message, isInternal, attachments } = req.body;
  const errors = [];

  // Check required fields
  if (!message || message.trim().length === 0) {
    errors.push('Message is required');
  }

  // Validate message length
  if (message && message.trim().length > 5000) {
    errors.push('Message cannot exceed 5000 characters');
  }

  // Validate isInternal
  if (isInternal !== undefined && typeof isInternal !== 'boolean') {
    errors.push('isInternal must be a boolean value');
  }

  // Validate attachments
  if (attachments !== undefined) {
    if (!Array.isArray(attachments)) {
      errors.push('Attachments must be an array');
    } else {
      attachments.forEach((attachment, index) => {
        if (!attachment.filename || !attachment.url) {
          errors.push(`Attachment ${index + 1} must have filename and url`);
        }
        if (attachment.size && typeof attachment.size !== 'number') {
          errors.push(`Attachment ${index + 1} size must be a number`);
        }
      });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors
    });
  }

  next();
};

const validateTicketEscalation = (req, res, next) => {
  const { escalateTo, reason, level } = req.body;
  const errors = [];

  // Check required fields
  if (!escalateTo || !mongoose.Types.ObjectId.isValid(escalateTo)) {
    errors.push('Valid escalateTo user ID is required');
  }

  if (!reason || reason.trim().length === 0) {
    errors.push('Escalation reason is required');
  }

  // Validate reason length
  if (reason && reason.trim().length > 500) {
    errors.push('Escalation reason cannot exceed 500 characters');
  }

  // Validate level if provided
  if (level !== undefined) {
    if (!Number.isInteger(level) || level < 1 || level > 5) {
      errors.push('Escalation level must be an integer between 1 and 5');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors
    });
  }

  next();
};

const validateFeedback = (req, res, next) => {
  const { rating, feedback } = req.body;
  const errors = [];

  // Check required fields
  if (!rating && rating !== 0) {
    errors.push('Rating is required');
  }

  // Validate rating
  if (rating !== undefined && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
    errors.push('Rating must be an integer between 1 and 5');
  }

  // Validate feedback length if provided
  if (feedback && feedback.trim().length > 1000) {
    errors.push('Feedback cannot exceed 1000 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors
    });
  }

  next();
};

const validateAnalyticsQuery = (req, res, next) => {
  const { period, startDate, endDate, department, agent } = req.query;
  const errors = [];

  // Validate period
  if (period && (isNaN(period) || parseInt(period) < 1 || parseInt(period) > 365)) {
    errors.push('Period must be a number between 1 and 365 days');
  }

  // Validate date format if provided
  if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    errors.push('Start date must be in YYYY-MM-DD format');
  }

  if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    errors.push('End date must be in YYYY-MM-DD format');
  }

  // Validate date range
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      errors.push('Start date cannot be after end date');
    }
    if (end > new Date()) {
      errors.push('End date cannot be in the future');
    }
  }

  // Validate department
  const validDepartments = ['technical_support', 'billing', 'product_support', 'logistics', 'customer_service'];
  if (department && !validDepartments.includes(department)) {
    errors.push(`Department must be one of: ${validDepartments.join(', ')}`);
  }

  // Validate agent ID
  if (agent && !mongoose.Types.ObjectId.isValid(agent)) {
    errors.push('Invalid agent ID format');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors
    });
  }

  next();
};

const validateTicketSearch = (req, res, next) => {
  const { page, limit, sortBy, sortOrder } = req.query;
  const errors = [];

  // Validate pagination
  if (page && (isNaN(page) || parseInt(page) < 1)) {
    errors.push('Page must be a positive integer');
  }

  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    errors.push('Limit must be between 1 and 100');
  }

  // Validate sorting
  const validSortFields = ['createdAt', 'lastUpdated', 'priority', 'status', 'category', 'ticketNumber'];
  if (sortBy && !validSortFields.includes(sortBy)) {
    errors.push(`sortBy must be one of: ${validSortFields.join(', ')}`);
  }

  if (sortOrder && !['asc', 'desc'].includes(sortOrder)) {
    errors.push('sortOrder must be either asc or desc');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors
    });
  }

  next();
};

module.exports = {
  validateTicketCreate,
  validateTicketUpdate,
  validateTicketId,
  validateTicketResponse,
  validateTicketEscalation,
  validateFeedback,
  validateAnalyticsQuery,
  validateTicketSearch
};
