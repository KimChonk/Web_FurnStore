const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { authenticateToken, requireRole } = require('../middlewares/auth');
const {
  validatePromotionCreate,
  validatePromotionUpdate,
  validatePromotionQuery,
  validatePromotionCode,
  validatePromotionId,
  validateDisplayUpdate,
  validateStaffPromotionQuery
} = require('../middlewares/promotionValidation');

// Get all promotions (admin/staff)
// GET /api/promotions
router.get('/',
  authenticateToken,
  requireRole(['admin', 'staff']),
  validatePromotionQuery,
  promotionController.getPromotions
);

// Create new promotion
// POST /api/promotions
router.post('/',
  authenticateToken,
  requireRole(['admin']),
  validatePromotionCreate,
  promotionController.createPromotion
);

// Get active promotions for public display
// GET /api/promotions/active
router.get('/active',
  promotionController.getActivePromotions
);

// Get promotions for staff use
// GET /api/promotions/staff
router.get('/staff',
  authenticateToken,
  requireRole(['admin', 'staff', 'warehouse']),
  validateStaffPromotionQuery,
  promotionController.getStaffPromotions
);

// Get promotion analytics
// GET /api/promotions/analytics
router.get('/analytics',
  authenticateToken,
  requireRole(['admin']),
  promotionController.getPromotionAnalytics
);

// Get single promotion
// GET /api/promotions/:id
router.get('/:id',
  authenticateToken,
  requireRole(['admin', 'staff']),
  validatePromotionId,
  promotionController.getPromotionById
);

// Update promotion
// PUT /api/promotions/:id
router.put('/:id',
  authenticateToken,
  requireRole(['admin']),
  validatePromotionId,
  validatePromotionUpdate,
  validateDisplayUpdate,
  promotionController.updatePromotion
);

// Approve promotion
// POST /api/promotions/:id/approve
router.post('/:id/approve',
  authenticateToken,
  requireRole(['admin']),
  validatePromotionId,
  promotionController.approvePromotion
);

// Delete promotion
// DELETE /api/promotions/:id
router.delete('/:id',
  authenticateToken,
  requireRole(['admin']),
  validatePromotionId,
  promotionController.deletePromotion
);

// Validate promotion code
// POST /api/promotions/validate/:code
router.post('/validate/:code',
  validatePromotionCode,
  promotionController.validatePromotionCode
);

// Track promotion view
// POST /api/promotions/:id/view
router.post('/:id/view',
  validatePromotionId,
  promotionController.trackPromotionView
);

module.exports = router;
