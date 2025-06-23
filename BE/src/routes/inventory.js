const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateToken, requireRole } = require('../middlewares/auth');
const {
  validateStockUpdate,
  validateDamageReport,
  validateInventoryQuery,
  validateWarehouseSearch,
  validateDamageReportQuery,
  validateAnalyticsQuery,
  validateProductId
} = require('../middlewares/inventoryValidation');

// Get inventory overview
// GET /api/inventory
router.get('/', 
  authenticateToken,
  requireRole(['admin', 'warehouse', 'staff']),
  validateInventoryQuery,
  inventoryController.getInventoryOverview
);

// Get specific product inventory
// GET /api/inventory/product/:productId
router.get('/product/:productId',
  authenticateToken,
  requireRole(['admin', 'warehouse', 'staff']),
  validateProductId,
  inventoryController.getProductInventory
);

// Update stock levels
// PUT /api/inventory/product/:productId/stock
router.put('/product/:productId/stock',
  authenticateToken,
  requireRole(['admin', 'warehouse']),
  validateProductId,
  validateStockUpdate,
  inventoryController.updateStock
);

// Search products in warehouse
// GET /api/inventory/search
router.get('/search',
  authenticateToken,
  requireRole(['admin', 'warehouse', 'delivery', 'staff']),
  validateWarehouseSearch,
  inventoryController.searchWarehouse
);

// Report damaged product
// POST /api/inventory/product/:productId/damaged
router.post('/product/:productId/damaged',
  authenticateToken,
  requireRole(['admin', 'warehouse', 'staff']),
  validateProductId,
  validateDamageReport,
  inventoryController.reportDamagedProduct
);

// Get damaged products report
// GET /api/inventory/damaged
router.get('/damaged',
  authenticateToken,
  requireRole(['admin', 'warehouse']),
  validateDamageReportQuery,
  inventoryController.getDamagedProducts
);

// Get stock alerts
// GET /api/inventory/alerts
router.get('/alerts',
  authenticateToken,
  requireRole(['admin', 'warehouse']),
  inventoryController.getStockAlerts
);

// Get inventory analytics
// GET /api/inventory/analytics
router.get('/analytics',
  authenticateToken,
  requireRole(['admin', 'warehouse']),
  validateAnalyticsQuery,
  inventoryController.getInventoryAnalytics
);

module.exports = router;
