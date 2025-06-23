const mongoose = require('mongoose');

const validateStockUpdate = (req, res, next) => {
  const { quantity, type, reason } = req.body;
  const errors = [];

  // Check required fields
  if (quantity === undefined || quantity === null) {
    errors.push('Quantity is required');
  }

  if (!type) {
    errors.push('Transaction type is required');
  }

  if (!reason || reason.trim().length === 0) {
    errors.push('Reason is required');
  }

  // Validate quantity
  if (typeof quantity !== 'number' || quantity < 0) {
    errors.push('Quantity must be a non-negative number');
  }

  if (quantity > 10000) {
    errors.push('Quantity cannot exceed 10,000 units');
  }

  // Validate transaction type
  const validTypes = ['in', 'out', 'adjustment', 'damaged', 'returned'];
  if (type && !validTypes.includes(type)) {
    errors.push('Invalid transaction type. Must be one of: ' + validTypes.join(', '));
  }

  // Validate reason length
  if (reason && reason.length > 200) {
    errors.push('Reason cannot exceed 200 characters');
  }

  // Validate notes length if provided
  if (req.body.notes && req.body.notes.length > 500) {
    errors.push('Notes cannot exceed 500 characters');
  }

  // Validate order ID format if provided
  if (req.body.orderId && !mongoose.Types.ObjectId.isValid(req.body.orderId)) {
    errors.push('Invalid order ID format');
  }

  // Validate warehouse location if provided
  if (req.body.warehouseLocation) {
    const { section, row, shelf, bin } = req.body.warehouseLocation;
    
    if (section && section.length > 50) {
      errors.push('Warehouse section cannot exceed 50 characters');
    }
    
    if (row && row.length > 20) {
      errors.push('Warehouse row cannot exceed 20 characters');
    }
    
    if (shelf && shelf.length > 20) {
      errors.push('Warehouse shelf cannot exceed 20 characters');
    }
    
    if (bin && bin.length > 20) {
      errors.push('Warehouse bin cannot exceed 20 characters');
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

const validateDamageReport = (req, res, next) => {
  const { quantity, damageType, severity, description } = req.body;
  const errors = [];

  // Check required fields
  if (quantity === undefined || quantity === null) {
    errors.push('Quantity is required');
  }

  if (!damageType) {
    errors.push('Damage type is required');
  }

  if (!severity) {
    errors.push('Severity is required');
  }

  if (!description || description.trim().length === 0) {
    errors.push('Description is required');
  }

  // Validate quantity
  if (typeof quantity !== 'number' || quantity <= 0) {
    errors.push('Quantity must be a positive number');
  }

  if (quantity > 1000) {
    errors.push('Cannot report more than 1,000 damaged units at once');
  }

  // Validate damage type
  const validDamageTypes = [
    'manufacturing_defect',
    'shipping_damage', 
    'warehouse_damage',
    'customer_return',
    'wear_and_tear'
  ];
  if (damageType && !validDamageTypes.includes(damageType)) {
    errors.push('Invalid damage type. Must be one of: ' + validDamageTypes.join(', '));
  }

  // Validate severity
  const validSeverities = ['minor', 'major', 'total_loss'];
  if (severity && !validSeverities.includes(severity)) {
    errors.push('Invalid severity. Must be one of: ' + validSeverities.join(', '));
  }

  // Validate description length
  if (description && description.length > 1000) {
    errors.push('Description cannot exceed 1,000 characters');
  }

  // Validate estimated loss if provided
  if (req.body.estimatedLoss !== undefined) {
    if (typeof req.body.estimatedLoss !== 'number' || req.body.estimatedLoss < 0) {
      errors.push('Estimated loss must be a non-negative number');
    }
  }

  // Validate photos array if provided
  if (req.body.photos) {
    if (!Array.isArray(req.body.photos)) {
      errors.push('Photos must be an array');
    } else if (req.body.photos.length > 10) {
      errors.push('Cannot upload more than 10 photos');
    } else {
      req.body.photos.forEach((photo, index) => {
        if (!photo.url || typeof photo.url !== 'string') {
          errors.push(`Photo ${index + 1} URL is required and must be a string`);
        }
        if (photo.description && photo.description.length > 200) {
          errors.push(`Photo ${index + 1} description cannot exceed 200 characters`);
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

const validateInventoryQuery = (req, res, next) => {
  const { page, limit, stockStatus, sortBy } = req.query;
  const errors = [];

  // Validate pagination
  if (page && (!Number.isInteger(Number(page)) || Number(page) < 1)) {
    errors.push('Page must be a positive integer');
  }

  if (limit && (!Number.isInteger(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
    errors.push('Limit must be between 1 and 100');
  }

  // Validate stock status filter
  const validStockStatuses = ['low_stock', 'out_of_stock', 'overstock', 'in_stock'];
  if (stockStatus && !validStockStatuses.includes(stockStatus)) {
    errors.push('Invalid stock status. Must be one of: ' + validStockStatuses.join(', '));
  }

  // Validate sort field
  const validSortFields = ['updatedAt', 'createdAt', 'currentStock', 'totalValue', 'sku'];
  if (sortBy && !validSortFields.includes(sortBy)) {
    errors.push('Invalid sort field. Must be one of: ' + validSortFields.join(', '));
  }

  // Validate search query length
  if (req.query.search && req.query.search.length < 2) {
    errors.push('Search query must be at least 2 characters long');
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

const validateWarehouseSearch = (req, res, next) => {
  const { query } = req.query;
  const errors = [];

  // Check required search query
  if (!query || query.trim().length < 2) {
    errors.push('Search query is required and must be at least 2 characters long');
  }

  if (query && query.length > 100) {
    errors.push('Search query cannot exceed 100 characters');
  }

  // Validate location if provided
  if (req.query.location && req.query.location.length > 50) {
    errors.push('Location filter cannot exceed 50 characters');
  }

  // Validate category ID if provided
  if (req.query.category && !mongoose.Types.ObjectId.isValid(req.query.category)) {
    errors.push('Invalid category ID format');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Search validation errors',
      errors
    });
  }

  next();
};

const validateDamageReportQuery = (req, res, next) => {
  const { status, severity, damageType, startDate, endDate } = req.query;
  const errors = [];

  // Validate status filter
  const validStatuses = ['reported', 'investigating', 'confirmed', 'resolved', 'disposed'];
  if (status && !validStatuses.includes(status)) {
    errors.push('Invalid status. Must be one of: ' + validStatuses.join(', '));
  }

  // Validate severity filter
  const validSeverities = ['minor', 'major', 'total_loss'];
  if (severity && !validSeverities.includes(severity)) {
    errors.push('Invalid severity. Must be one of: ' + validSeverities.join(', '));
  }

  // Validate damage type filter
  const validDamageTypes = [
    'manufacturing_defect',
    'shipping_damage',
    'warehouse_damage', 
    'customer_return',
    'wear_and_tear'
  ];
  if (damageType && !validDamageTypes.includes(damageType)) {
    errors.push('Invalid damage type. Must be one of: ' + validDamageTypes.join(', '));
  }

  // Validate date range
  if (startDate && !Date.parse(startDate)) {
    errors.push('Invalid start date format');
  }

  if (endDate && !Date.parse(endDate)) {
    errors.push('Invalid end date format');
  }

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    errors.push('Start date must be before end date');
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

const validateAnalyticsQuery = (req, res, next) => {
  const { period } = req.query;
  const errors = [];

  // Validate period
  const validPeriods = ['7days', '30days', '90days'];
  if (period && !validPeriods.includes(period)) {
    errors.push('Invalid period. Must be one of: ' + validPeriods.join(', '));
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Analytics query validation errors',
      errors
    });
  }

  next();
};

const validateProductId = (req, res, next) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid product ID format'
    });
  }

  next();
};

module.exports = {
  validateStockUpdate,
  validateDamageReport,
  validateInventoryQuery,
  validateWarehouseSearch,
  validateDamageReportQuery,
  validateAnalyticsQuery,
  validateProductId
};
