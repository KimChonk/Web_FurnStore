const path = require('path');
const { deleteFileByUrl } = require('../middlewares/upload');

// @desc    Upload single image
// @route   POST /api/upload/single
// @access  Private
const uploadSingle = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: req.file.url,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Upload multiple images
// @route   POST /api/upload/multiple
// @access  Private
const uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const fileData = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      url: file.url,
      mimetype: file.mimetype
    }));

    res.status(200).json({
      success: true,
      message: `${req.files.length} file(s) uploaded successfully`,
      data: fileData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Upload product images
// @route   POST /api/upload/product-images
// @access  Private/Admin
const uploadProductImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const images = req.files.map((file, index) => ({
      url: file.url,
      altText: req.body.altTexts ? req.body.altTexts[index] : '',
      isPrimary: index === 0 // First image is primary by default
    }));

    res.status(200).json({
      success: true,
      message: 'Product images uploaded successfully',
      data: images
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete uploaded file
// @route   DELETE /api/upload/delete
// @access  Private
const deleteUploadedFile = async (req, res) => {
  try {
    const { fileUrl } = req.body;

    if (!fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'File URL is required'
      });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const deleted = deleteFileByUrl(fileUrl, baseUrl);

    if (deleted) {
      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found or could not be deleted'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get upload limits and allowed types
// @route   GET /api/upload/config
// @access  Public
const getUploadConfig = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      maxFileSize: '5MB',
      maxFiles: 10,
      allowedTypes: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
      allowedMimeTypes: [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp'
      ]
    }
  });
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadProductImages,
  deleteUploadedFile,
  getUploadConfig
};
