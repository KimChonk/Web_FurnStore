const mongoose = require('mongoose');

const validateStoreCreate = (req, res, next) => {
  const { name, address, phoneNumber, email, manager, operatingHours } = req.body;
  const errors = [];

  // Check required fields
  if (!name || name.trim().length === 0) {
    errors.push('Store name is required');
  }

  if (!address || !address.street || !address.city || !address.country) {
    errors.push('Complete address (street, city, country) is required');
  }

  if (!phoneNumber || phoneNumber.trim().length === 0) {
    errors.push('Phone number is required');
  }

  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  }

  if (!manager || !mongoose.Types.ObjectId.isValid(manager)) {
    errors.push('Valid manager ID is required');
  }

  // Validate name length
  if (name && name.trim().length > 100) {
    errors.push('Store name cannot exceed 100 characters');
  }

  // Validate email format
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Invalid email format');
  }

  // Validate phone number format
  if (phoneNumber && !/^[\+]?[0-9\s\-\(\)]{8,15}$/.test(phoneNumber)) {
    errors.push('Invalid phone number format');
  }

  // Validate postal code format
  if (address && address.postalCode && !/^[A-Za-z0-9\s\-]{3,10}$/.test(address.postalCode)) {
    errors.push('Invalid postal code format');
  }

  // Validate coordinates if provided
  if (address && address.coordinates) {
    const { latitude, longitude } = address.coordinates;
    if (latitude && (latitude < -90 || latitude > 90)) {
      errors.push('Latitude must be between -90 and 90');
    }
    if (longitude && (longitude < -180 || longitude > 180)) {
      errors.push('Longitude must be between -180 and 180');
    }
  }

  // Validate operating hours format
  if (operatingHours) {
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    for (const day of validDays) {
      if (operatingHours[day]) {
        const { open, close, isClosed } = operatingHours[day];
        if (!isClosed) {
          if (!open || !close) {
            errors.push(`Operating hours for ${day} must include open and close times`);
          }
          if (open && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(open)) {
            errors.push(`Invalid open time format for ${day} (use HH:MM)`);
          }
          if (close && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(close)) {
            errors.push(`Invalid close time format for ${day} (use HH:MM)`);
          }
        }
      }
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

const validateStoreUpdate = (req, res, next) => {
  const { name, address, phoneNumber, email, manager, operatingHours, status } = req.body;
  const errors = [];

  // Validate name if provided
  if (name !== undefined) {
    if (!name || name.trim().length === 0) {
      errors.push('Store name cannot be empty');
    }
    if (name && name.trim().length > 100) {
      errors.push('Store name cannot exceed 100 characters');
    }
  }

  // Validate email format if provided
  if (email !== undefined) {
    if (!email || email.trim().length === 0) {
      errors.push('Email cannot be empty');
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Invalid email format');
    }
  }

  // Validate phone number if provided
  if (phoneNumber !== undefined) {
    if (!phoneNumber || phoneNumber.trim().length === 0) {
      errors.push('Phone number cannot be empty');
    }
    if (phoneNumber && !/^[\+]?[0-9\s\-\(\)]{8,15}$/.test(phoneNumber)) {
      errors.push('Invalid phone number format');
    }
  }

  // Validate manager ID if provided
  if (manager !== undefined && !mongoose.Types.ObjectId.isValid(manager)) {
    errors.push('Invalid manager ID format');
  }

  // Validate address if provided
  if (address !== undefined) {
    if (!address.street || !address.city || !address.country) {
      errors.push('Complete address (street, city, country) is required');
    }
    if (address.postalCode && !/^[A-Za-z0-9\s\-]{3,10}$/.test(address.postalCode)) {
      errors.push('Invalid postal code format');
    }
    if (address.coordinates) {
      const { latitude, longitude } = address.coordinates;
      if (latitude && (latitude < -90 || latitude > 90)) {
        errors.push('Latitude must be between -90 and 90');
      }
      if (longitude && (longitude < -180 || longitude > 180)) {
        errors.push('Longitude must be between -180 and 180');
      }
    }
  }

  // Validate status if provided
  if (status !== undefined && !['active', 'inactive', 'maintenance', 'closed'].includes(status)) {
    errors.push('Status must be one of: active, inactive, maintenance, closed');
  }

  // Validate operating hours if provided
  if (operatingHours !== undefined) {
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    for (const day of validDays) {
      if (operatingHours[day]) {
        const { open, close, isClosed } = operatingHours[day];
        if (!isClosed) {
          if (!open || !close) {
            errors.push(`Operating hours for ${day} must include open and close times`);
          }
          if (open && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(open)) {
            errors.push(`Invalid open time format for ${day} (use HH:MM)`);
          }
          if (close && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(close)) {
            errors.push(`Invalid close time format for ${day} (use HH:MM)`);
          }
        }
      }
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

const validateStoreId = (req, res, next) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid store ID format'
    });
  }

  next();
};

const validateStoreStaffManagement = (req, res, next) => {
  const { staffId, action } = req.body;
  const errors = [];

  if (!staffId || !mongoose.Types.ObjectId.isValid(staffId)) {
    errors.push('Valid staff ID is required');
  }

  if (!action || !['add', 'remove', 'update'].includes(action)) {
    errors.push('Action must be one of: add, remove, update');
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

const validateNearbySearch = (req, res, next) => {
  const { latitude, longitude, radius } = req.query;
  const errors = [];

  if (!latitude || !longitude) {
    errors.push('Latitude and longitude are required');
  }

  if (latitude && (isNaN(latitude) || latitude < -90 || latitude > 90)) {
    errors.push('Latitude must be a number between -90 and 90');
  }

  if (longitude && (isNaN(longitude) || longitude < -180 || longitude > 180)) {
    errors.push('Longitude must be a number between -180 and 180');
  }

  if (radius && (isNaN(radius) || radius <= 0 || radius > 1000)) {
    errors.push('Radius must be a number between 0 and 1000 kilometers');
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

const validateRevenueQuery = (req, res, next) => {
  const { startDate, endDate, period } = req.query;
  const errors = [];

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
  }

  // Validate period if provided
  if (period && !['daily', 'weekly', 'monthly', 'yearly'].includes(period)) {
    errors.push('Period must be one of: daily, weekly, monthly, yearly');
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
  validateStoreCreate,
  validateStoreUpdate,
  validateStoreId,
  validateStoreStaffManagement,
  validateNearbySearch,
  validateRevenueQuery
};
