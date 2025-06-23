const mongoose = require('mongoose');

const validatePromotionCreate = (req, res, next) => {
  const {
    name,
    description,
    type,
    discountValue,
    validity,
    applicableProducts,
    targetCustomers,
    usageLimit,
    buyXGetY,
    bundleProducts
  } = req.body;
  const errors = [];

  // Check required fields
  if (!name || name.trim().length === 0) {
    errors.push('Promotion name is required');
  }

  if (!description || description.trim().length === 0) {
    errors.push('Description is required');
  }

  if (!type) {
    errors.push('Promotion type is required');
  }

  if (!validity || !validity.startDate || !validity.endDate) {
    errors.push('Start date and end date are required');
  }

  // Validate name length
  if (name && name.length > 100) {
    errors.push('Promotion name cannot exceed 100 characters');
  }

  // Validate description length
  if (description && description.length > 500) {
    errors.push('Description cannot exceed 500 characters');
  }

  // Validate promotion type
  const validTypes = ['percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y', 'bundle'];
  if (type && !validTypes.includes(type)) {
    errors.push('Invalid promotion type. Must be one of: ' + validTypes.join(', '));
  }

  // Validate discount value for percentage and fixed amount types
  if (['percentage', 'fixed_amount'].includes(type)) {
    if (discountValue === undefined || discountValue === null) {
      errors.push('Discount value is required for this promotion type');
    } else if (typeof discountValue !== 'number' || discountValue <= 0) {
      errors.push('Discount value must be a positive number');
    } else if (type === 'percentage' && discountValue > 100) {
      errors.push('Percentage discount cannot exceed 100%');
    } else if (type === 'fixed_amount' && discountValue > 50000000) {
      errors.push('Fixed discount amount cannot exceed ₫50,000,000');
    }
  }

  // Validate max discount amount if provided
  if (req.body.maxDiscountAmount !== undefined) {
    if (typeof req.body.maxDiscountAmount !== 'number' || req.body.maxDiscountAmount < 0) {
      errors.push('Max discount amount must be a non-negative number');
    }
  }

  // Validate minimum order amount
  if (req.body.minOrderAmount !== undefined) {
    if (typeof req.body.minOrderAmount !== 'number' || req.body.minOrderAmount < 0) {
      errors.push('Minimum order amount must be a non-negative number');
    }
  }

  // Validate dates
  if (validity && validity.startDate && validity.endDate) {
    const startDate = new Date(validity.startDate);
    const endDate = new Date(validity.endDate);
    
    if (isNaN(startDate.getTime())) {
      errors.push('Invalid start date format');
    }
    
    if (isNaN(endDate.getTime())) {
      errors.push('Invalid end date format');
    }
    
    if (startDate >= endDate) {
      errors.push('Start date must be before end date');
    }
    
    // Check if start date is not too far in the past
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    if (startDate < oneYearAgo) {
      errors.push('Start date cannot be more than 1 year in the past');
    }
    
    // Check if end date is not too far in the future
    const twoYearsFromNow = new Date();
    twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
    if (endDate > twoYearsFromNow) {
      errors.push('End date cannot be more than 2 years in the future');
    }
  }

  // Validate applicable products
  if (applicableProducts && Array.isArray(applicableProducts)) {
    if (applicableProducts.length > 1000) {
      errors.push('Cannot have more than 1,000 applicable products');
    }
    
    applicableProducts.forEach((item, index) => {
      if (item.productId && !mongoose.Types.ObjectId.isValid(item.productId)) {
        errors.push(`Invalid product ID at index ${index}`);
      }
      if (item.categoryId && !mongoose.Types.ObjectId.isValid(item.categoryId)) {
        errors.push(`Invalid category ID at index ${index}`);
      }
    });
  }

  // Validate target customers
  if (targetCustomers) {
    const validTargetTypes = ['all', 'new_customers', 'returning_customers', 'vip_customers', 'specific_customers'];
    if (targetCustomers.type && !validTargetTypes.includes(targetCustomers.type)) {
      errors.push('Invalid target customer type. Must be one of: ' + validTargetTypes.join(', '));
    }
    
    if (targetCustomers.customerIds && Array.isArray(targetCustomers.customerIds)) {
      if (targetCustomers.customerIds.length > 10000) {
        errors.push('Cannot target more than 10,000 specific customers');
      }
      
      targetCustomers.customerIds.forEach((customerId, index) => {
        if (!mongoose.Types.ObjectId.isValid(customerId)) {
          errors.push(`Invalid customer ID at index ${index}`);
        }
      });
    }
    
    if (targetCustomers.customerTiers && Array.isArray(targetCustomers.customerTiers)) {
      const validTiers = ['bronze', 'silver', 'gold', 'platinum'];
      targetCustomers.customerTiers.forEach((tier, index) => {
        if (!validTiers.includes(tier)) {
          errors.push(`Invalid customer tier at index ${index}. Must be one of: ${validTiers.join(', ')}`);
        }
      });
    }
  }

  // Validate usage limits
  if (usageLimit) {
    if (usageLimit.totalLimit !== undefined) {
      if (!Number.isInteger(usageLimit.totalLimit) || usageLimit.totalLimit < 1) {
        errors.push('Total usage limit must be a positive integer');
      } else if (usageLimit.totalLimit > 1000000) {
        errors.push('Total usage limit cannot exceed 1,000,000');
      }
    }
    
    if (usageLimit.perCustomerLimit !== undefined) {
      if (!Number.isInteger(usageLimit.perCustomerLimit) || usageLimit.perCustomerLimit < 1) {
        errors.push('Per customer limit must be a positive integer');
      } else if (usageLimit.perCustomerLimit > 100) {
        errors.push('Per customer limit cannot exceed 100');
      }
    }
  }

  // Validate buy X get Y configuration
  if (type === 'buy_x_get_y' && buyXGetY) {
    if (!buyXGetY.buyQuantity || !Number.isInteger(buyXGetY.buyQuantity) || buyXGetY.buyQuantity < 1) {
      errors.push('Buy quantity must be a positive integer');
    }
    
    if (!buyXGetY.getQuantity || !Number.isInteger(buyXGetY.getQuantity) || buyXGetY.getQuantity < 1) {
      errors.push('Get quantity must be a positive integer');
    }
    
    if (buyXGetY.getFreeProduct && !mongoose.Types.ObjectId.isValid(buyXGetY.getFreeProduct)) {
      errors.push('Invalid free product ID');
    }
  }

  // Validate bundle products
  if (type === 'bundle' && bundleProducts) {
    if (!Array.isArray(bundleProducts) || bundleProducts.length < 2) {
      errors.push('Bundle must contain at least 2 products');
    } else if (bundleProducts.length > 20) {
      errors.push('Bundle cannot contain more than 20 products');
    } else {
      bundleProducts.forEach((item, index) => {
        if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
          errors.push(`Invalid product ID in bundle at index ${index}`);
        }
        
        if (!item.quantity || !Number.isInteger(item.quantity) || item.quantity < 1) {
          errors.push(`Bundle product quantity at index ${index} must be a positive integer`);
        }
        
        if (item.discountedPrice !== undefined) {
          if (typeof item.discountedPrice !== 'number' || item.discountedPrice < 0) {
            errors.push(`Bundle product discounted price at index ${index} must be a non-negative number`);
          }
        }
      });
    }
  }

  // Validate promotion code if provided
  if (req.body.code) {
    if (!/^[A-Z0-9-_]{3,20}$/.test(req.body.code.toUpperCase())) {
      errors.push('Promotion code must be 3-20 characters and contain only letters, numbers, hyphens and underscores');
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

const validatePromotionUpdate = (req, res, next) => {
  const {
    name,
    description,
    type,
    discountValue,
    validity,
    applicableProducts,
    targetCustomers,
    usageLimit
  } = req.body;
  const errors = [];

  // Validate name if provided
  if (name !== undefined) {
    if (!name || name.trim().length === 0) {
      errors.push('Promotion name cannot be empty');
    } else if (name.length > 100) {
      errors.push('Promotion name cannot exceed 100 characters');
    }
  }

  // Validate description if provided
  if (description !== undefined) {
    if (!description || description.trim().length === 0) {
      errors.push('Description cannot be empty');
    } else if (description.length > 500) {
      errors.push('Description cannot exceed 500 characters');
    }
  }

  // Validate type if provided
  if (type !== undefined) {
    const validTypes = ['percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y', 'bundle'];
    if (!validTypes.includes(type)) {
      errors.push('Invalid promotion type. Must be one of: ' + validTypes.join(', '));
    }
  }

  // Validate discount value if provided
  if (discountValue !== undefined) {
    if (typeof discountValue !== 'number' || discountValue <= 0) {
      errors.push('Discount value must be a positive number');
    } else if (type === 'percentage' && discountValue > 100) {
      errors.push('Percentage discount cannot exceed 100%');
    } else if (type === 'fixed_amount' && discountValue > 50000000) {
      errors.push('Fixed discount amount cannot exceed ₫50,000,000');
    }
  }

  // Validate dates if provided
  if (validity) {
    if (validity.startDate && validity.endDate) {
      const startDate = new Date(validity.startDate);
      const endDate = new Date(validity.endDate);
      
      if (startDate >= endDate) {
        errors.push('Start date must be before end date');
      }
    }
  }

  // Validate promotion code if provided
  if (req.body.code !== undefined) {
    if (req.body.code && !/^[A-Z0-9-_]{3,20}$/.test(req.body.code.toUpperCase())) {
      errors.push('Promotion code must be 3-20 characters and contain only letters, numbers, hyphens and underscores');
    }
  }

  // Validate status if provided
  if (req.body.status !== undefined) {
    const validStatuses = ['draft', 'active', 'paused', 'expired', 'cancelled'];
    if (!validStatuses.includes(req.body.status)) {
      errors.push('Invalid status. Must be one of: ' + validStatuses.join(', '));
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

const validatePromotionQuery = (req, res, next) => {
  const { page, limit, status, type, sortBy, startDate, endDate } = req.query;
  const errors = [];

  // Validate pagination
  if (page && (!Number.isInteger(Number(page)) || Number(page) < 1)) {
    errors.push('Page must be a positive integer');
  }

  if (limit && (!Number.isInteger(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
    errors.push('Limit must be between 1 and 100');
  }

  // Validate status filter
  const validStatuses = ['draft', 'active', 'paused', 'expired', 'cancelled'];
  if (status && !validStatuses.includes(status)) {
    errors.push('Invalid status. Must be one of: ' + validStatuses.join(', '));
  }

  // Validate type filter
  const validTypes = ['percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y', 'bundle'];
  if (type && !validTypes.includes(type)) {
    errors.push('Invalid type. Must be one of: ' + validTypes.join(', '));
  }

  // Validate sort field
  const validSortFields = ['createdAt', 'updatedAt', 'name', 'validity.startDate', 'validity.endDate', 'display.displayOrder'];
  if (sortBy && !validSortFields.includes(sortBy)) {
    errors.push('Invalid sort field. Must be one of: ' + validSortFields.join(', '));
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

const validatePromotionCode = (req, res, next) => {
  const { code } = req.params;
  const { orderAmount, customerId } = req.body;
  const errors = [];

  // Validate promotion code
  if (!code || code.trim().length === 0) {
    errors.push('Promotion code is required');
  } else if (!/^[A-Z0-9-_]{3,20}$/i.test(code)) {
    errors.push('Invalid promotion code format');
  }

  // Validate order amount
  if (orderAmount === undefined || orderAmount === null) {
    errors.push('Order amount is required');
  } else if (typeof orderAmount !== 'number' || orderAmount < 0) {
    errors.push('Order amount must be a non-negative number');
  }

  // Validate customer ID if provided
  if (customerId && !mongoose.Types.ObjectId.isValid(customerId)) {
    errors.push('Invalid customer ID format');
  }

  // Validate items array if provided
  if (req.body.items && !Array.isArray(req.body.items)) {
    errors.push('Items must be an array');
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

const validatePromotionId = (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid promotion ID format'
    });
  }

  next();
};

const validateDisplayUpdate = (req, res, next) => {
  const { display } = req.body;
  const errors = [];

  if (display) {
    // Validate display order
    if (display.displayOrder !== undefined) {
      if (!Number.isInteger(display.displayOrder) || display.displayOrder < 0) {
        errors.push('Display order must be a non-negative integer');
      }
    }

    // Validate badge text
    if (display.badgeText && display.badgeText.length > 50) {
      errors.push('Badge text cannot exceed 50 characters');
    }

    // Validate highlight color
    if (display.highlightColor && !/^#[0-9A-F]{6}$/i.test(display.highlightColor)) {
      errors.push('Highlight color must be a valid hex color code');
    }

    // Validate banner image URL
    if (display.bannerImage && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(display.bannerImage)) {
      errors.push('Banner image must be a valid image URL');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Display validation errors',
      errors
    });
  }

  next();
};

const validateStaffPromotionQuery = (req, res, next) => {
  const { page, limit, status, search } = req.query;
  const errors = [];

  // Validate pagination
  if (page && (!Number.isInteger(Number(page)) || Number(page) < 1)) {
    errors.push('Page must be a positive integer');
  }

  if (limit && (!Number.isInteger(Number(limit)) || Number(limit) < 1 || Number(limit) > 50)) {
    errors.push('Limit must be between 1 and 50 for staff queries');
  }

  // Validate status
  const validStatuses = ['active', 'draft', 'paused', 'expired'];
  if (status && !validStatuses.includes(status)) {
    errors.push('Invalid status for staff query. Must be one of: ' + validStatuses.join(', '));
  }

  // Validate search length
  if (search && search.length < 2) {
    errors.push('Search query must be at least 2 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Staff query validation errors',
      errors
    });
  }

  next();
};

module.exports = {
  validatePromotionCreate,
  validatePromotionUpdate,
  validatePromotionQuery,
  validatePromotionCode,
  validatePromotionId,
  validateDisplayUpdate,
  validateStaffPromotionQuery
};
