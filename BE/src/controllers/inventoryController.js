const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const Order = require('../models/Order');
const mongoose = require('mongoose');

const inventoryController = {
  // Get inventory overview
  getInventoryOverview: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        category,
        location,
        stockStatus,
        sortBy = 'updatedAt',
        sortOrder = 'desc'
      } = req.query;

      const query = { isActive: true };
      
      // Search functionality
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        const products = await Product.find({
          $or: [
            { name: searchRegex },
            { sku: searchRegex }
          ]
        }).select('_id');
        
        const productIds = products.map(p => p._id);
        query.$or = [
          { sku: searchRegex },
          { productId: { $in: productIds } }
        ];
      }

      // Filter by stock status
      if (stockStatus) {
        switch (stockStatus) {
          case 'low_stock':
            query.$expr = { $lte: ['$currentStock', '$reorderPoint'] };
            break;
          case 'out_of_stock':
            query.currentStock = 0;
            break;
          case 'overstock':
            query.$expr = { $gt: ['$currentStock', '$maxStockLevel'] };
            break;
          case 'in_stock':
            query.currentStock = { $gt: 0 };
            break;
        }
      }

      // Filter by warehouse location
      if (location) {
        query['warehouseLocation.section'] = new RegExp(location, 'i');
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
        populate: [
          {
            path: 'productId',
            select: 'name sku category images price',
            populate: {
              path: 'category',
              select: 'name'
            }
          }
        ]
      };

      const result = await Inventory.paginate(query, options);

      // Calculate summary statistics
      const summary = await Inventory.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalStock: { $sum: '$currentStock' },
            totalValue: { $sum: '$totalValue' },
            lowStockItems: {
              $sum: {
                $cond: [{ $lte: ['$currentStock', '$reorderPoint'] }, 1, 0]
              }
            },
            outOfStockItems: {
              $sum: {
                $cond: [{ $eq: ['$currentStock', 0] }, 1, 0]
              }
            },
            overstockItems: {
              $sum: {
                $cond: [{ $gt: ['$currentStock', '$maxStockLevel'] }, 1, 0]
              }
            }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          inventory: result.docs,
          pagination: {
            currentPage: result.page,
            totalPages: result.totalPages,
            totalItems: result.totalDocs,
            itemsPerPage: result.limit,
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage
          },
          summary: summary[0] || {
            totalProducts: 0,
            totalStock: 0,
            totalValue: 0,
            lowStockItems: 0,
            outOfStockItems: 0,
            overstockItems: 0
          }
        }
      });
    } catch (error) {
      console.error('Error getting inventory overview:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get inventory overview',
        error: error.message
      });
    }
  },

  // Get specific product inventory
  getProductInventory: async (req, res) => {
    try {
      const { productId } = req.params;

      const inventory = await Inventory.findOne({ 
        productId: new mongoose.Types.ObjectId(productId),
        isActive: true 
      }).populate('productId', 'name sku category images price');

      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: 'Product inventory not found'
        });
      }

      res.json({
        success: true,
        data: inventory
      });
    } catch (error) {
      console.error('Error getting product inventory:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get product inventory',
        error: error.message
      });
    }
  },

  // Update stock levels
  updateStock: async (req, res) => {
    try {
      const { productId } = req.params;
      const { 
        quantity, 
        type, 
        reason, 
        orderId, 
        notes,
        warehouseLocation 
      } = req.body;

      const inventory = await Inventory.findOne({ 
        productId: new mongoose.Types.ObjectId(productId),
        isActive: true 
      });

      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: 'Product inventory not found'
        });
      }

      // Calculate new stock level
      let newStock = inventory.currentStock;
      
      switch (type) {
        case 'in':
          newStock += quantity;
          break;
        case 'out':
          newStock = Math.max(0, newStock - quantity);
          break;
        case 'adjustment':
          newStock = quantity; // Direct adjustment to specific quantity
          break;
        case 'damaged':
          newStock = Math.max(0, newStock - quantity);
          break;
        case 'returned':
          newStock += quantity;
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid transaction type'
          });
      }

      // Create transaction record
      const transaction = {
        type,
        quantity: type === 'adjustment' ? quantity - inventory.currentStock : quantity,
        reason,
        orderId: orderId || null,
        staffId: req.user.id,
        notes
      };

      // Update inventory
      inventory.currentStock = newStock;
      inventory.transactions.push(transaction);
      
      if (warehouseLocation) {
        inventory.warehouseLocation = warehouseLocation;
      }

      if (type === 'in') {
        inventory.lastRestocked = new Date();
      } else if (type === 'out') {
        inventory.lastSold = new Date();
      }

      await inventory.save();

      // Populate product details for response
      await inventory.populate('productId', 'name sku');

      res.json({
        success: true,
        message: 'Stock updated successfully',
        data: {
          productId: inventory.productId,
          previousStock: inventory.currentStock - transaction.quantity,
          newStock: inventory.currentStock,
          transaction: transaction,
          alerts: inventory.stockAlerts.filter(alert => alert.isActive)
        }
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update stock',
        error: error.message
      });
    }
  },

  // Search products in warehouse
  searchWarehouse: async (req, res) => {
    try {
      const { 
        query: searchQuery, 
        location, 
        category,
        inStock = true 
      } = req.query;

      if (!searchQuery || searchQuery.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters long'
        });
      }

      const searchRegex = new RegExp(searchQuery.trim(), 'i');
      
      // First find products matching the search criteria
      const productQuery = {
        $or: [
          { name: searchRegex },
          { sku: searchRegex },
          { description: searchRegex }
        ],
        isActive: true
      };

      if (category) {
        productQuery.category = new mongoose.Types.ObjectId(category);
      }

      const products = await Product.find(productQuery).select('_id');
      const productIds = products.map(p => p._id);

      // Build inventory query
      const inventoryQuery = {
        $or: [
          { sku: searchRegex },
          { productId: { $in: productIds } }
        ],
        isActive: true
      };

      if (inStock === 'true') {
        inventoryQuery.currentStock = { $gt: 0 };
      }

      if (location) {
        inventoryQuery['warehouseLocation.section'] = new RegExp(location, 'i');
      }

      const inventoryItems = await Inventory.find(inventoryQuery)
        .populate('productId', 'name sku category images price')
        .sort({ 'warehouseLocation.section': 1, 'warehouseLocation.row': 1 })
        .limit(50);

      // Group by warehouse location for easier navigation
      const groupedResults = inventoryItems.reduce((acc, item) => {
        const locationKey = item.warehouseLocation.section || 'Unassigned';
        if (!acc[locationKey]) {
          acc[locationKey] = [];
        }
        acc[locationKey].push(item);
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          results: inventoryItems,
          groupedByLocation: groupedResults,
          totalFound: inventoryItems.length,
          searchQuery: searchQuery.trim()
        }
      });
    } catch (error) {
      console.error('Error searching warehouse:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search warehouse',
        error: error.message
      });
    }
  },

  // Report damaged product
  reportDamagedProduct: async (req, res) => {
    try {
      const { productId } = req.params;
      const {
        quantity,
        damageType,
        severity,
        description,
        photos = [],
        estimatedLoss
      } = req.body;

      const inventory = await Inventory.findOne({ 
        productId: new mongoose.Types.ObjectId(productId),
        isActive: true 
      });

      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: 'Product inventory not found'
        });
      }

      if (quantity > inventory.currentStock) {
        return res.status(400).json({
          success: false,
          message: 'Cannot report more damaged items than current stock'
        });
      }

      // Create damage report
      const damageReport = {
        damageType,
        severity,
        description,
        photos,
        reportedBy: req.user.id,
        financialImpact: {
          estimatedLoss: estimatedLoss || 0
        }
      };

      // Add to inventory
      inventory.damagedReports.push(damageReport);

      // Update stock
      inventory.currentStock = Math.max(0, inventory.currentStock - quantity);

      // Add transaction
      inventory.transactions.push({
        type: 'damaged',
        quantity,
        reason: `Damaged product report: ${damageType}`,
        staffId: req.user.id,
        notes: description
      });

      // Add damaged stock alert
      inventory.stockAlerts.push({
        type: 'damaged_stock',
        message: `${quantity} units reported as damaged: ${damageType}`
      });

      await inventory.save();

      // Get the newly created report with generated ID
      const newReport = inventory.damagedReports[inventory.damagedReports.length - 1];

      res.json({
        success: true,
        message: 'Damaged product reported successfully',
        data: {
          reportId: newReport.reportId,
          productId: inventory.productId,
          damagedQuantity: quantity,
          newStockLevel: inventory.currentStock,
          report: newReport
        }
      });
    } catch (error) {
      console.error('Error reporting damaged product:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to report damaged product',
        error: error.message
      });
    }
  },

  // Get damaged products report
  getDamagedProducts: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        severity,
        damageType,
        startDate,
        endDate
      } = req.query;

      const pipeline = [
        { $match: { isActive: true } },
        { $unwind: '$damagedReports' },
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $lookup: {
            from: 'users',
            localField: 'damagedReports.reportedBy',
            foreignField: '_id',
            as: 'reporter'
          }
        },
        { $unwind: '$reporter' }
      ];

      // Apply filters
      const matchConditions = {};
      
      if (status) {
        matchConditions['damagedReports.status'] = status;
      }
      
      if (severity) {
        matchConditions['damagedReports.severity'] = severity;
      }
      
      if (damageType) {
        matchConditions['damagedReports.damageType'] = damageType;
      }
      
      if (startDate || endDate) {
        matchConditions['damagedReports.createdAt'] = {};
        if (startDate) {
          matchConditions['damagedReports.createdAt'].$gte = new Date(startDate);
        }
        if (endDate) {
          matchConditions['damagedReports.createdAt'].$lte = new Date(endDate);
        }
      }

      if (Object.keys(matchConditions).length > 0) {
        pipeline.push({ $match: matchConditions });
      }

      // Project fields
      pipeline.push({
        $project: {
          _id: '$damagedReports._id',
          reportId: '$damagedReports.reportId',
          product: {
            _id: '$product._id',
            name: '$product.name',
            sku: '$product.sku'
          },
          damageType: '$damagedReports.damageType',
          severity: '$damagedReports.severity',
          description: '$damagedReports.description',
          status: '$damagedReports.status',
          financialImpact: '$damagedReports.financialImpact',
          reporter: {
            name: '$reporter.name',
            email: '$reporter.email'
          },
          createdAt: '$damagedReports.createdAt',
          resolvedAt: '$damagedReports.resolution.resolvedAt'
        }
      });

      // Sort by creation date
      pipeline.push({ $sort: { createdAt: -1 } });

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: parseInt(limit) });

      const [reports, totalCount] = await Promise.all([
        Inventory.aggregate(pipeline),
        Inventory.aggregate([
          ...pipeline.slice(0, -2), // Remove skip and limit
          { $count: 'total' }
        ])
      ]);

      const total = totalCount[0]?.total || 0;

      res.json({
        success: true,
        data: {
          reports,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalItems: total,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting damaged products:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get damaged products report',
        error: error.message
      });
    }
  },

  // Get stock alerts
  getStockAlerts: async (req, res) => {
    try {
      const { type, isActive = true } = req.query;

      const query = { isActive: true };
      
      if (type) {
        query['stockAlerts.type'] = type;
      }

      const inventoryItems = await Inventory.find(query)
        .populate('productId', 'name sku')
        .select('productId stockAlerts currentStock reorderPoint maxStockLevel');

      // Flatten alerts and filter
      const alerts = [];
      inventoryItems.forEach(item => {
        item.stockAlerts.forEach(alert => {
          if (isActive === 'true' && !alert.isActive) return;
          if (isActive === 'false' && alert.isActive) return;
          
          alerts.push({
            _id: alert._id,
            type: alert.type,
            message: alert.message,
            isActive: alert.isActive,
            createdAt: alert.createdAt,
            product: item.productId,
            currentStock: item.currentStock,
            reorderPoint: item.reorderPoint,
            maxStockLevel: item.maxStockLevel
          });
        });
      });

      // Sort by creation date (newest first)
      alerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      res.json({
        success: true,
        data: {
          alerts,
          summary: {
            total: alerts.length,
            lowStock: alerts.filter(a => a.type === 'low_stock').length,
            overstock: alerts.filter(a => a.type === 'overstock').length,
            damaged: alerts.filter(a => a.type === 'damaged_stock').length,
            reorderNeeded: alerts.filter(a => a.type === 'reorder_needed').length
          }
        }
      });
    } catch (error) {
      console.error('Error getting stock alerts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get stock alerts',
        error: error.message
      });
    }
  },

  // Get inventory analytics
  getInventoryAnalytics: async (req, res) => {
    try {
      const { period = '30days' } = req.query;
      
      let startDate;
      const endDate = new Date();
      
      switch (period) {
        case '7days':
          startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90days':
          startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const analytics = await Inventory.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalValue: { $sum: '$totalValue' },
            totalStock: { $sum: '$currentStock' },
            averageStockLevel: { $avg: '$currentStock' },
            lowStockItems: {
              $sum: {
                $cond: [{ $lte: ['$currentStock', '$reorderPoint'] }, 1, 0]
              }
            },
            outOfStockItems: {
              $sum: {
                $cond: [{ $eq: ['$currentStock', 0] }, 1, 0]
              }
            }
          }
        }
      ]);

      // Get transaction history for the period
      const transactionStats = await Inventory.aggregate([
        { $match: { isActive: true } },
        { $unwind: '$transactions' },
        {
          $match: {
            'transactions.createdAt': { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$transactions.type',
            count: { $sum: 1 },
            totalQuantity: { $sum: '$transactions.quantity' }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          summary: analytics[0] || {},
          transactions: transactionStats,
          period: {
            startDate,
            endDate,
            days: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
          }
        }
      });
    } catch (error) {
      console.error('Error getting inventory analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get inventory analytics',
        error: error.message
      });
    }
  }
};

module.exports = inventoryController;
