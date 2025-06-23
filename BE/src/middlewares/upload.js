const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
const productsDir = path.join(uploadsDir, 'products');
const categoriesDir = path.join(uploadsDir, 'categories');
const usersDir = path.join(uploadsDir, 'users');
const deliveryDir = path.join(uploadsDir, 'delivery');

[uploadsDir, productsDir, categoriesDir, usersDir, deliveryDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = uploadsDir;
    
    // Determine upload path based on route
    if (req.baseUrl.includes('/products')) {
      uploadPath = productsDir;
    } else if (req.baseUrl.includes('/categories')) {
      uploadPath = categoriesDir;
    } else if (req.baseUrl.includes('/users')) {
      uploadPath = usersDir;
    } else if (req.baseUrl.includes('/delivery')) {
      uploadPath = deliveryDir;
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension);
    const safeBasename = basename.replace(/[^a-zA-Z0-9]/g, '_');
    
    cb(null, safeBasename + '_' + uniqueSuffix + extension);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files per request
  },
  fileFilter: fileFilter
});

// Middleware for single image upload
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const singleUpload = upload.single(fieldName);
    
    singleUpload(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'File too large. Maximum size is 5MB.'
            });
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
              success: false,
              message: 'Unexpected field name. Use: ' + fieldName
            });
          }
        }
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      // Add file URL to request
      if (req.file) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        req.file.url = `${baseUrl}/uploads/${path.relative(uploadsDir, req.file.path).replace(/\\/g, '/')}`;
      }
      
      next();
    });
  };
};

// Middleware for multiple image upload
const uploadMultiple = (fieldName, maxCount = 10) => {
  return (req, res, next) => {
    const multipleUpload = upload.array(fieldName, maxCount);
    
    multipleUpload(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'File too large. Maximum size is 5MB per file.'
            });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              success: false,
              message: `Too many files. Maximum is ${maxCount} files.`
            });
          }
        }
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      // Add file URLs to request
      if (req.files && req.files.length > 0) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        req.files = req.files.map(file => ({
          ...file,
          url: `${baseUrl}/uploads/${path.relative(uploadsDir, file.path).replace(/\\/g, '/')}`
        }));
      }
      
      next();
    });
  };
};

// Middleware for mixed upload (multiple fields)
const uploadFields = (fields) => {
  return (req, res, next) => {
    const fieldsUpload = upload.fields(fields);
    
    fieldsUpload(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'File too large. Maximum size is 5MB per file.'
            });
          }
        }
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      // Add file URLs to request
      if (req.files) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        
        Object.keys(req.files).forEach(fieldName => {
          req.files[fieldName] = req.files[fieldName].map(file => ({
            ...file,
            url: `${baseUrl}/uploads/${path.relative(uploadsDir, file.path).replace(/\\/g, '/')}`
          }));
        });
      }
      
      next();
    });
  };
};

// Helper function to delete uploaded file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Helper function to delete file by URL
const deleteFileByUrl = (fileUrl, baseUrl) => {
  try {
    const relativePath = fileUrl.replace(baseUrl + '/uploads/', '');
    const fullPath = path.join(uploadsDir, relativePath);
    return deleteFile(fullPath);
  } catch (error) {
    console.error('Error deleting file by URL:', error);
    return false;
  }
};

// Specific upload configurations for different purposes
const uploadDeliveryPhotos = upload.array('photos', 10); // Max 10 delivery photos

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  uploadDeliveryPhotos,
  deleteFile,
  deleteFileByUrl
};
