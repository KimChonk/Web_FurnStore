const mongoose = require('mongoose');

const validateCreateProduct = (req, res, next) => {
  const { name, description, sku, price, category, inventory } = req.body;
  const errors = [];

  // Check required fields
  if (!name || name.trim().length === 0) {
    errors.push('Product name is required');
  }

  if (!description || description.trim().length === 0) {
    errors.push('Product description is required');
  }

  if (!sku || sku.trim().length === 0) {
    errors.push('SKU is required');
  }

  if (price === undefined || price === null) {
    errors.push('Price is required');
  }

  if (!category) {
    errors.push('Category is required');
  }

  // Validate field lengths
  if (name && name.length > 200) {
    errors.push('Product name cannot exceed 200 characters');
  }

  if (description && description.length > 2000) {
    errors.push('Description cannot exceed 2000 characters');
  }

  if (req.body.shortDescription && req.body.shortDescription.length > 500) {
    errors.push('Short description cannot exceed 500 characters');
  }

  // Validate numeric fields
  if (price !== undefined && (isNaN(price) || price < 0)) {
    errors.push('Price must be a positive number');
  }

  if (req.body.comparePrice !== undefined && (isNaN(req.body.comparePrice) || req.body.comparePrice < 0)) {
    errors.push('Compare price must be a positive number');
  }

  if (req.body.costPrice !== undefined && (isNaN(req.body.costPrice) || req.body.costPrice < 0)) {
    errors.push('Cost price must be a positive number');
  }

  // Validate ObjectIds
  if (category && !mongoose.isValidObjectId(category)) {
    errors.push('Invalid category ID');
  }

  if (req.body.subcategory && !mongoose.isValidObjectId(req.body.subcategory)) {
    errors.push('Invalid subcategory ID');
  }

  // Validate inventory
  if (inventory) {
    if (inventory.quantity !== undefined && (isNaN(inventory.quantity) || inventory.quantity < 0)) {
      errors.push('Inventory quantity must be a non-negative number');
    }

    if (inventory.minQuantity !== undefined && (isNaN(inventory.minQuantity) || inventory.minQuantity < 0)) {
      errors.push('Minimum quantity must be a non-negative number');
    }

    if (inventory.reserved !== undefined && (isNaN(inventory.reserved) || inventory.reserved < 0)) {
      errors.push('Reserved quantity must be a non-negative number');
    }
  }

  // Validate enum fields
  if (req.body.status && !['active', 'inactive', 'draft', 'archived'].includes(req.body.status)) {
    errors.push('Invalid status value');
  }

  if (req.body.visibility && !['public', 'private', 'hidden'].includes(req.body.visibility)) {
    errors.push('Invalid visibility value');
  }

  // Validate images array
  if (req.body.images && Array.isArray(req.body.images)) {
    req.body.images.forEach((image, index) => {
      if (!image.url) {
        errors.push(`Image ${index + 1} must have a URL`);
      }
    });
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

const validateUpdateProduct = (req, res, next) => {
  const errors = [];

  // Validate field lengths if provided
  if (req.body.name && req.body.name.length > 200) {
    errors.push('Product name cannot exceed 200 characters');
  }

  if (req.body.description && req.body.description.length > 2000) {
    errors.push('Description cannot exceed 2000 characters');
  }

  if (req.body.shortDescription && req.body.shortDescription.length > 500) {
    errors.push('Short description cannot exceed 500 characters');
  }

  // Validate numeric fields if provided
  if (req.body.price !== undefined && (isNaN(req.body.price) || req.body.price < 0)) {
    errors.push('Price must be a positive number');
  }

  if (req.body.comparePrice !== undefined && (isNaN(req.body.comparePrice) || req.body.comparePrice < 0)) {
    errors.push('Compare price must be a positive number');
  }

  if (req.body.costPrice !== undefined && (isNaN(req.body.costPrice) || req.body.costPrice < 0)) {
    errors.push('Cost price must be a positive number');
  }

  // Validate ObjectIds if provided
  if (req.body.category && !mongoose.isValidObjectId(req.body.category)) {
    errors.push('Invalid category ID');
  }

  if (req.body.subcategory && !mongoose.isValidObjectId(req.body.subcategory)) {
    errors.push('Invalid subcategory ID');
  }

  // Validate enum fields if provided
  if (req.body.status && !['active', 'inactive', 'draft', 'archived'].includes(req.body.status)) {
    errors.push('Invalid status value');
  }

  if (req.body.visibility && !['public', 'private', 'hidden'].includes(req.body.visibility)) {
    errors.push('Invalid visibility value');
  }

  // Validate inventory if provided
  if (req.body.inventory) {
    if (req.body.inventory.quantity !== undefined && (isNaN(req.body.inventory.quantity) || req.body.inventory.quantity < 0)) {
      errors.push('Inventory quantity must be a non-negative number');
    }

    if (req.body.inventory.minQuantity !== undefined && (isNaN(req.body.inventory.minQuantity) || req.body.inventory.minQuantity < 0)) {
      errors.push('Minimum quantity must be a non-negative number');
    }

    if (req.body.inventory.reserved !== undefined && (isNaN(req.body.inventory.reserved) || req.body.inventory.reserved < 0)) {
      errors.push('Reserved quantity must be a non-negative number');
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

const validateInventoryUpdate = (req, res, next) => {
  const { quantity, reserved, minQuantity } = req.body;
  const errors = [];

  // At least one field should be provided
  if (quantity === undefined && reserved === undefined && minQuantity === undefined && 
      req.body.trackQuantity === undefined && req.body.allowBackorder === undefined) {
    errors.push('At least one inventory field is required');
  }

  // Validate numeric fields
  if (quantity !== undefined && (isNaN(quantity) || quantity < 0)) {
    errors.push('Quantity must be a non-negative number');
  }

  if (reserved !== undefined && (isNaN(reserved) || reserved < 0)) {
    errors.push('Reserved quantity must be a non-negative number');
  }

  if (minQuantity !== undefined && (isNaN(minQuantity) || minQuantity < 0)) {
    errors.push('Minimum quantity must be a non-negative number');
  }

  // Validate boolean fields
  if (req.body.trackQuantity !== undefined && typeof req.body.trackQuantity !== 'boolean') {
    errors.push('Track quantity must be a boolean value');
  }

  if (req.body.allowBackorder !== undefined && typeof req.body.allowBackorder !== 'boolean') {
    errors.push('Allow backorder must be a boolean value');
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

const validateCreateCategory = (req, res, next) => {
  const { name } = req.body;
  const errors = [];

  // Check required fields
  if (!name || name.trim().length === 0) {
    errors.push('Category name is required');
  }

  // Validate field lengths
  if (name && name.length > 50) {
    errors.push('Category name cannot exceed 50 characters');
  }

  if (req.body.description && req.body.description.length > 500) {
    errors.push('Description cannot exceed 500 characters');
  }

  // Validate parent category if provided
  if (req.body.parentCategory && !mongoose.isValidObjectId(req.body.parentCategory)) {
    errors.push('Invalid parent category ID');
  }

  // Validate sort order
  if (req.body.sortOrder !== undefined && (isNaN(req.body.sortOrder) || req.body.sortOrder < 0)) {
    errors.push('Sort order must be a non-negative number');
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

const validateUpdateCategory = (req, res, next) => {
  const errors = [];

  // Validate field lengths if provided
  if (req.body.name && req.body.name.length > 50) {
    errors.push('Category name cannot exceed 50 characters');
  }

  if (req.body.description && req.body.description.length > 500) {
    errors.push('Description cannot exceed 500 characters');
  }

  // Validate parent category if provided
  if (req.body.parentCategory && !mongoose.isValidObjectId(req.body.parentCategory)) {
    errors.push('Invalid parent category ID');
  }

  // Validate sort order if provided
  if (req.body.sortOrder !== undefined && (isNaN(req.body.sortOrder) || req.body.sortOrder < 0)) {
    errors.push('Sort order must be a non-negative number');
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

const validateProductQuery = (req, res, next) => {
  const { page, limit, minPrice, maxPrice, sortOrder } = req.query;
  const errors = [];

  // Validate pagination
  if (page && (isNaN(page) || parseInt(page) < 1)) {
    errors.push('Page must be a positive number');
  }

  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    errors.push('Limit must be a number between 1 and 100');
  }

  // Validate price range
  if (minPrice && (isNaN(minPrice) || parseFloat(minPrice) < 0)) {
    errors.push('Minimum price must be a non-negative number');
  }

  if (maxPrice && (isNaN(maxPrice) || parseFloat(maxPrice) < 0)) {
    errors.push('Maximum price must be a non-negative number');
  }

  if (minPrice && maxPrice && parseFloat(minPrice) > parseFloat(maxPrice)) {
    errors.push('Minimum price cannot be greater than maximum price');
  }

  // Validate sort order
  if (sortOrder && !['asc', 'desc'].includes(sortOrder)) {
    errors.push('Sort order must be either "asc" or "desc"');
  }

  // Validate category and subcategory IDs
  if (req.query.category && !mongoose.isValidObjectId(req.query.category)) {
    errors.push('Invalid category ID');
  }

  if (req.query.subcategory && !mongoose.isValidObjectId(req.query.subcategory)) {
    errors.push('Invalid subcategory ID');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid query parameters',
      errors
    });
  }

  next();
};

// Middleware to check warehouse manager or admin role for inventory updates
const requireInventoryAccess = (req, res, next) => {
  const allowedRoles = ['admin', 'warehouse_manager'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Warehouse manager or admin role required.'
    });
  }
  next();
};

module.exports = {
  validateCreateProduct,
  validateUpdateProduct,
  validateInventoryUpdate,
  validateCreateCategory,
  validateUpdateCategory,
  validateProductQuery,
  requireInventoryAccess
};
