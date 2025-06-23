const validateCreateStaff = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];

  // Check required fields
  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  }

  if (!password || password.length === 0) {
    errors.push('Password is required');
  }

  if (!role || role.trim().length === 0) {
    errors.push('Role is required');
  }

  // Validate email format
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (email && !emailRegex.test(email)) {
    errors.push('Please provide a valid email');
  }

  // Validate password strength
  if (password && password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  // Validate role
  const allowedRoles = ['delivery', 'warehouse_manager', 'customer_service', 'admin'];
  if (role && !allowedRoles.includes(role)) {
    errors.push('Invalid role. Allowed roles: ' + allowedRoles.join(', '));
  }

  // Validate name length
  if (name && name.trim().length > 50) {
    errors.push('Name cannot be more than 50 characters');
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

const validateUpdateUser = (req, res, next) => {
  const { name, email, role } = req.body;
  const errors = [];

  // Validate email format if provided
  if (email) {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      errors.push('Please provide a valid email');
    }
  }

  // Validate role if provided
  if (role) {
    const allowedRoles = ['customer', 'delivery', 'warehouse_manager', 'customer_service', 'admin'];
    if (!allowedRoles.includes(role)) {
      errors.push('Invalid role. Allowed roles: ' + allowedRoles.join(', '));
    }
  }

  // Validate name length if provided
  if (name && name.trim().length > 50) {
    errors.push('Name cannot be more than 50 characters');
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

const validateProfileUpdate = (req, res, next) => {
  const { personalInfo, contactInfo, addresses } = req.body;
  const errors = [];

  // Validate personal info if provided
  if (personalInfo) {
    if (personalInfo.gender && !['male', 'female', 'other'].includes(personalInfo.gender)) {
      errors.push('Invalid gender value');
    }
    
    if (personalInfo.dateOfBirth) {
      const dob = new Date(personalInfo.dateOfBirth);
      const now = new Date();
      if (dob > now) {
        errors.push('Date of birth cannot be in the future');
      }
    }
  }

  // Validate contact info if provided
  if (contactInfo) {
    if (contactInfo.primaryPhone && !/^[0-9+\-\s()]+$/.test(contactInfo.primaryPhone)) {
      errors.push('Invalid primary phone number format');
    }
    
    if (contactInfo.secondaryPhone && !/^[0-9+\-\s()]+$/.test(contactInfo.secondaryPhone)) {
      errors.push('Invalid secondary phone number format');
    }
  }

  // Validate addresses if provided
  if (addresses && Array.isArray(addresses)) {
    addresses.forEach((address, index) => {
      if (address.type && !['home', 'work', 'shipping', 'billing'].includes(address.type)) {
        errors.push(`Invalid address type at index ${index}`);
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

const validateQueryParams = (req, res, next) => {
  const { page, limit, sortOrder } = req.query;
  const errors = [];

  // Validate page
  if (page && (isNaN(page) || parseInt(page) < 1)) {
    errors.push('Page must be a positive number');
  }

  // Validate limit
  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    errors.push('Limit must be a number between 1 and 100');
  }

  // Validate sort order
  if (sortOrder && !['asc', 'desc'].includes(sortOrder)) {
    errors.push('Sort order must be either "asc" or "desc"');
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

// Role-based middleware
const requireCustomerRole = (req, res, next) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({
      success: false,
      message: 'This endpoint is only available for customers'
    });
  }
  next();
};

const requireStaffRole = (req, res, next) => {
  const staffRoles = ['delivery', 'warehouse_manager', 'customer_service', 'admin'];
  if (!staffRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Staff access required'
    });
  }
  next();
};

module.exports = {
  validateCreateStaff,
  validateUpdateUser,
  validateProfileUpdate,
  validateQueryParams,
  requireCustomerRole,
  requireStaffRole
};
