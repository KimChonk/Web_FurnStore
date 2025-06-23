const mongoose = require('mongoose');

const validateCategoryCreate = (req, res, next) => {
  const { name, description, parentCategory, sortOrder } = req.body;
  const errors = [];

  // Check required fields
  if (!name || name.trim().length === 0) {
    errors.push('Category name is required');
  }

  // Validate name length
  if (name && name.trim().length > 50) {
    errors.push('Category name cannot exceed 50 characters');
  }

  // Validate description length
  if (description && description.length > 500) {
    errors.push('Description cannot exceed 500 characters');
  }

  // Validate parent category ID format
  if (parentCategory && !mongoose.Types.ObjectId.isValid(parentCategory)) {
    errors.push('Invalid parent category ID format');
  }

  // Validate sort order
  if (sortOrder !== undefined && (!Number.isInteger(sortOrder) || sortOrder < 0)) {
    errors.push('Sort order must be a non-negative integer');
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

const validateCategoryUpdate = (req, res, next) => {
  const { name, description, parentCategory, sortOrder } = req.body;
  const errors = [];

  // Validate name length if provided
  if (name !== undefined) {
    if (!name || name.trim().length === 0) {
      errors.push('Category name cannot be empty');
    }
    if (name && name.trim().length > 50) {
      errors.push('Category name cannot exceed 50 characters');
    }
  }

  // Validate description length if provided
  if (description !== undefined && description.length > 500) {
    errors.push('Description cannot exceed 500 characters');
  }

  // Validate parent category ID format if provided
  if (parentCategory !== undefined) {
    if (parentCategory !== null && !mongoose.Types.ObjectId.isValid(parentCategory)) {
      errors.push('Invalid parent category ID format');
    }
    
    // Check if trying to set parent to itself
    if (parentCategory === req.params.id) {
      errors.push('Category cannot be its own parent');
    }
  }

  // Validate sort order if provided
  if (sortOrder !== undefined && (!Number.isInteger(sortOrder) || sortOrder < 0)) {
    errors.push('Sort order must be a non-negative integer');
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

const validateCategoryId = (req, res, next) => {
  const { id } = req.params;
  
  // Check if it's a valid ObjectId or could be a slug
  if (!mongoose.Types.ObjectId.isValid(id) && !/^[a-z0-9-]+$/.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid category ID or slug format'
    });
  }

  next();
};

const validateSEOData = (req, res, next) => {
  const { seoData } = req.body;
  const errors = [];

  if (seoData) {
    // Validate meta title
    if (seoData.metaTitle && seoData.metaTitle.length > 60) {
      errors.push('Meta title cannot exceed 60 characters');
    }

    // Validate meta description
    if (seoData.metaDescription && seoData.metaDescription.length > 160) {
      errors.push('Meta description cannot exceed 160 characters');
    }

    // Validate keywords
    if (seoData.keywords) {
      if (!Array.isArray(seoData.keywords)) {
        errors.push('Keywords must be an array');
      } else if (seoData.keywords.length > 10) {
        errors.push('Cannot have more than 10 keywords');
      } else {
        seoData.keywords.forEach((keyword, index) => {
          if (typeof keyword !== 'string' || keyword.trim().length === 0) {
            errors.push(`Keyword at index ${index} must be a non-empty string`);
          }
          if (keyword.length > 30) {
            errors.push(`Keyword at index ${index} cannot exceed 30 characters`);
          }
        });
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'SEO validation errors',
      errors
    });
  }

  next();
};

module.exports = {
  validateCategoryCreate,
  validateCategoryUpdate,
  validateCategoryId,
  validateSEOData
};
