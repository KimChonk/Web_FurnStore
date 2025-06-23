const express = require('express');
const {
  uploadSingle,
  uploadMultiple,
  uploadProductImages,
  deleteUploadedFile,
  getUploadConfig
} = require('../controllers/uploadController');

const { auth, adminAuth } = require('../middlewares/auth');
const { uploadSingle: uploadSingleMW, uploadMultiple: uploadMultipleMW } = require('../middlewares/upload');

const router = express.Router();

// Get upload configuration
router.get('/config', getUploadConfig);

// Upload single image
router.post('/single', auth, uploadSingleMW('image'), uploadSingle);

// Upload multiple images
router.post('/multiple', auth, uploadMultipleMW('images', 10), uploadMultiple);

// Upload product images (admin only)
router.post('/product-images', auth, adminAuth, uploadMultipleMW('images', 10), uploadProductImages);

// Delete uploaded file
router.delete('/delete', auth, deleteUploadedFile);

module.exports = router;
