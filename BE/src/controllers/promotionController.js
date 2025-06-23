const Promotion = require('../models/Promotion');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const mongoose = require('mongoose');

const promotionController = {
  // Create new promotion
  createPromotion: async (req, res) => {
    try {
      const {
        name,
        description,
        code,
        type,
        discountValue,
        maxDiscountAmount,
        minOrderAmount,
        applicableProducts,
        targetCustomers,
        usageLimit,
        validity,
        conditions,
        buyXGetY,
        bundleProducts,
        display,
        notes
      } = req.body;

      // Check if code already exists
      if (code) {
        const existingPromotion = await Promotion.findOne({ 
          code: code.toUpperCase(),
          isActive: true 
        });
        
        if (existingPromotion) {
          return res.status(400).json({
            success: false,
            message: 'Promotion code already exists'
          });
        }
      }

      // Validate dates
      if (new Date(validity.startDate) >= new Date(validity.endDate)) {
        return res.status(400).json({
          success: false,
          message: 'Start date must be before end date'
        });
      }

      const promotion = new Promotion({
        name,
        description,
        code: code?.toUpperCase(),
        type,
        discountValue,
        maxDiscountAmount,
        minOrderAmount,
        applicableProducts,
        targetCustomers,
        usageLimit,
        validity,
        conditions,
        buyXGetY,
        bundleProducts,
        display,
        notes,
        createdBy: req.user.id,
        status: 'draft'
      });

      await promotion.save();

      const populatedPromotion = await Promotion.findById(promotion._id)
        .populate('applicableProducts.productId', 'name sku price')
        .populate('applicableProducts.categoryId', 'name')
        .populate('createdBy', 'name email');

      res.status(201).json({
        success: true,
        message: 'Promotion created successfully',
        data: populatedPromotion
      });
    } catch (error) {
      console.error('Error creating promotion:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create promotion',
        error: error.message
      });
    }
  },

  // Get all promotions with filtering
  getPromotions: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        type,
        search,
        startDate,
        endDate,
        featuredOnly,
        activeOnly,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const query = { isActive: true };

      // Apply filters
      if (status) {
        query.status = status;
      }

      if (type) {
        query.type = type;
      }

      if (search) {
        const searchRegex = new RegExp(search, 'i');
        query.$or = [
          { name: searchRegex },
          { description: searchRegex },
          { code: searchRegex }
        ];
      }

      if (startDate || endDate) {
        query['validity.startDate'] = {};
        if (startDate) {
          query['validity.startDate'].$gte = new Date(startDate);
        }
        if (endDate) {
          query['validity.endDate'] = { $lte: new Date(endDate) };
        }
      }

      if (featuredOnly === 'true') {
        query['display.featuredPromotion'] = true;
      }

      if (activeOnly === 'true') {
        const now = new Date();
        query.status = 'active';
        query['validity.startDate'] = { $lte: now };
        query['validity.endDate'] = { $gte: now };
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
        populate: [
          {
            path: 'applicableProducts.productId',
            select: 'name sku price images'
          },
          {
            path: 'applicableProducts.categoryId',
            select: 'name'
          },
          {
            path: 'createdBy',
            select: 'name email'
          },
          {
            path: 'approvedBy',
            select: 'name email'
          }
        ]
      };

      const result = await Promotion.paginate(query, options);

      // Add virtual fields for current validity
      const promotionsWithStatus = result.docs.map(promotion => {
        const promotionObj = promotion.toObject();
        promotionObj.isCurrentlyValid = promotion.isCurrentlyValid;
        promotionObj.remainingUsage = promotion.remainingUsage;
        return promotionObj;
      });

      res.json({
        success: true,
        data: {
          promotions: promotionsWithStatus,
          pagination: {
            currentPage: result.page,
            totalPages: result.totalPages,
            totalItems: result.totalDocs,
            itemsPerPage: result.limit,
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage
          }
        }
      });
    } catch (error) {
      console.error('Error getting promotions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get promotions',
        error: error.message
      });
    }
  },

  // Get single promotion
  getPromotionById: async (req, res) => {
    try {
      const { id } = req.params;

      const promotion = await Promotion.findOne({
        _id: new mongoose.Types.ObjectId(id),
        isActive: true
      })
      .populate('applicableProducts.productId', 'name sku price images')
      .populate('applicableProducts.categoryId', 'name')
      .populate('targetCustomers.customerIds', 'name email')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email');

      if (!promotion) {
        return res.status(404).json({
          success: false,
          message: 'Promotion not found'
        });
      }

      const promotionObj = promotion.toObject();
      promotionObj.isCurrentlyValid = promotion.isCurrentlyValid;
      promotionObj.remainingUsage = promotion.remainingUsage;

      res.json({
        success: true,
        data: promotionObj
      });
    } catch (error) {
      console.error('Error getting promotion:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get promotion',
        error: error.message
      });
    }
  },

  // Update promotion
  updatePromotion: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const promotion = await Promotion.findOne({
        _id: new mongoose.Types.ObjectId(id),
        isActive: true
      });

      if (!promotion) {
        return res.status(404).json({
          success: false,
          message: 'Promotion not found'
        });
      }

      // Check if promotion is already active and has been used
      if (promotion.status === 'active' && promotion.currentUsage.totalUsed > 0) {
        // Restrict updates for active promotions with usage
        const allowedUpdates = ['description', 'display', 'notes', 'status'];
        const invalidUpdates = Object.keys(updates).filter(key => !allowedUpdates.includes(key));
        
        if (invalidUpdates.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Cannot modify core promotion details after it has been used',
            invalidFields: invalidUpdates
          });
        }
      }

      // Check code uniqueness if being updated
      if (updates.code && updates.code !== promotion.code) {
        const existingPromotion = await Promotion.findOne({
          code: updates.code.toUpperCase(),
          _id: { $ne: promotion._id },
          isActive: true
        });

        if (existingPromotion) {
          return res.status(400).json({
            success: false,
            message: 'Promotion code already exists'
          });
        }
        updates.code = updates.code.toUpperCase();
      }

      // Validate dates if being updated
      if (updates.validity) {
        const startDate = updates.validity.startDate || promotion.validity.startDate;
        const endDate = updates.validity.endDate || promotion.validity.endDate;
        
        if (new Date(startDate) >= new Date(endDate)) {
          return res.status(400).json({
            success: false,
            message: 'Start date must be before end date'
          });
        }
      }

      Object.assign(promotion, updates);
      await promotion.save();

      const updatedPromotion = await Promotion.findById(promotion._id)
        .populate('applicableProducts.productId', 'name sku price')
        .populate('applicableProducts.categoryId', 'name')
        .populate('createdBy', 'name email')
        .populate('approvedBy', 'name email');

      res.json({
        success: true,
        message: 'Promotion updated successfully',
        data: updatedPromotion
      });
    } catch (error) {
      console.error('Error updating promotion:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update promotion',
        error: error.message
      });
    }
  },

  // Approve promotion
  approvePromotion: async (req, res) => {
    try {
      const { id } = req.params;

      const promotion = await Promotion.findOne({
        _id: new mongoose.Types.ObjectId(id),
        isActive: true
      });

      if (!promotion) {
        return res.status(404).json({
          success: false,
          message: 'Promotion not found'
        });
      }

      if (promotion.status !== 'draft') {
        return res.status(400).json({
          success: false,
          message: 'Only draft promotions can be approved'
        });
      }

      promotion.status = 'active';
      promotion.approvedBy = req.user.id;
      promotion.approvedAt = new Date();

      await promotion.save();

      const approvedPromotion = await Promotion.findById(promotion._id)
        .populate('createdBy', 'name email')
        .populate('approvedBy', 'name email');

      res.json({
        success: true,
        message: 'Promotion approved and activated successfully',
        data: approvedPromotion
      });
    } catch (error) {
      console.error('Error approving promotion:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to approve promotion',
        error: error.message
      });
    }
  },

  // Delete promotion (soft delete)
  deletePromotion: async (req, res) => {
    try {
      const { id } = req.params;

      const promotion = await Promotion.findOne({
        _id: new mongoose.Types.ObjectId(id),
        isActive: true
      });

      if (!promotion) {
        return res.status(404).json({
          success: false,
          message: 'Promotion not found'
        });
      }

      // Check if promotion has been used
      if (promotion.currentUsage.totalUsed > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete promotion that has been used. Consider setting status to cancelled instead.'
        });
      }

      promotion.isActive = false;
      promotion.status = 'cancelled';
      await promotion.save();

      res.json({
        success: true,
        message: 'Promotion deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting promotion:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete promotion',
        error: error.message
      });
    }
  },

  // Get active promotions for display
  getActivePromotions: async (req, res) => {
    try {
      const { 
        featuredOnly, 
        customerId,
        categoryId,
        productId 
      } = req.query;

      let query = {
        status: 'active',
        isActive: true,
        'validity.startDate': { $lte: new Date() },
        'validity.endDate': { $gte: new Date() }
      };

      if (featuredOnly === 'true') {
        query['display.featuredPromotion'] = true;
      }

      // Filter by applicable products/categories
      if (categoryId) {
        query['applicableProducts.categoryId'] = new mongoose.Types.ObjectId(categoryId);
      }

      if (productId) {
        query['applicableProducts.productId'] = new mongoose.Types.ObjectId(productId);
      }

      const promotions = await Promotion.find(query)
        .populate('applicableProducts.productId', 'name sku price images')
        .populate('applicableProducts.categoryId', 'name')
        .sort({ 
          'display.displayOrder': 1, 
          'display.featuredPromotion': -1, 
          createdAt: -1 
        })
        .limit(20);

      // Filter promotions applicable to customer
      let filteredPromotions = promotions;
      if (customerId) {
        filteredPromotions = promotions.filter(promotion => 
          promotion.isApplicableToCustomer(customerId)
        );
      }

      // Add display information
      const displayPromotions = filteredPromotions.map(promotion => {
        const promoObj = promotion.toObject();
        promoObj.isCurrentlyValid = promotion.isCurrentlyValid;
        promoObj.remainingUsage = promotion.remainingUsage;
        
        // Hide sensitive information for public display
        delete promoObj.currentUsage;
        delete promoObj.performance;
        delete promoObj.createdBy;
        delete promoObj.approvedBy;
        
        return promoObj;
      });

      res.json({
        success: true,
        data: {
          promotions: displayPromotions,
          total: displayPromotions.length
        }
      });
    } catch (error) {
      console.error('Error getting active promotions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get active promotions',
        error: error.message
      });
    }
  },

  // Get staff promotion list
  getStaffPromotions: async (req, res) => {
    try {
      const { 
        page = 1,
        limit = 10,
        status = 'active',
        search 
      } = req.query;

      const query = {
        isActive: true,
        status: status
      };

      if (status === 'active') {
        const now = new Date();
        query['validity.startDate'] = { $lte: now };
        query['validity.endDate'] = { $gte: now };
      }

      if (search) {
        const searchRegex = new RegExp(search, 'i');
        query.$or = [
          { name: searchRegex },
          { code: searchRegex },
          { description: searchRegex }
        ];
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { 
          'display.featuredPromotion': -1,
          'display.displayOrder': 1,
          createdAt: -1 
        },
        select: 'name code type discountValue maxDiscountAmount minOrderAmount validity display remainingUsage',
        populate: [
          {
            path: 'applicableProducts.productId',
            select: 'name sku'
          },
          {
            path: 'applicableProducts.categoryId',
            select: 'name'
          }
        ]
      };

      const result = await Promotion.paginate(query, options);

      // Add quick reference information for staff
      const staffPromotions = result.docs.map(promotion => {
        const promoObj = promotion.toObject();
        promoObj.isCurrentlyValid = promotion.isCurrentlyValid;
        promoObj.remainingUsage = promotion.remainingUsage;
        
        // Add quick info for staff
        promoObj.quickInfo = {
          discountText: promotion.type === 'percentage' 
            ? `${promotion.discountValue}% off`
            : promotion.type === 'fixed_amount'
            ? `₫${promotion.discountValue.toLocaleString()} off`
            : promotion.type === 'free_shipping'
            ? 'Free shipping'
            : 'Special offer',
          validUntil: promotion.validity.endDate,
          applicableItems: promotion.applicableProducts.length || 'All products'
        };
        
        return promoObj;
      });

      res.json({
        success: true,
        data: {
          promotions: staffPromotions,
          pagination: {
            currentPage: result.page,
            totalPages: result.totalPages,
            totalItems: result.totalDocs,
            itemsPerPage: result.limit
          }
        }
      });
    } catch (error) {
      console.error('Error getting staff promotions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get staff promotions',
        error: error.message
      });
    }
  },

  // Validate promotion code
  validatePromotionCode: async (req, res) => {
    try {
      const { code } = req.params;
      const { customerId, orderAmount, items = [] } = req.body;

      const promotion = await Promotion.findOne({
        code: code.toUpperCase(),
        status: 'active',
        isActive: true,
        'validity.startDate': { $lte: new Date() },
        'validity.endDate': { $gte: new Date() }
      })
      .populate('applicableProducts.productId', 'name sku')
      .populate('applicableProducts.categoryId', 'name');

      if (!promotion) {
        return res.status(404).json({
          success: false,
          message: 'Invalid or expired promotion code'
        });
      }

      // Check customer eligibility
      if (customerId && !promotion.isApplicableToCustomer(customerId)) {
        return res.status(400).json({
          success: false,
          message: 'This promotion is not applicable to your account'
        });
      }

      // Check minimum order amount
      if (orderAmount < promotion.minOrderAmount) {
        return res.status(400).json({
          success: false,
          message: `Minimum order amount of ₫${promotion.minOrderAmount.toLocaleString()} required`
        });
      }

      // Check usage limits
      if (promotion.usageLimit.totalLimit && 
          promotion.currentUsage.totalUsed >= promotion.usageLimit.totalLimit) {
        return res.status(400).json({
          success: false,
          message: 'Promotion usage limit reached'
        });
      }

      if (customerId && promotion.usageLimit.perCustomerLimit) {
        const customerUsage = promotion.currentUsage.customerUsage.find(
          usage => usage.customerId.toString() === customerId
        );
        
        if (customerUsage && customerUsage.usageCount >= promotion.usageLimit.perCustomerLimit) {
          return res.status(400).json({
            success: false,
            message: 'You have reached the usage limit for this promotion'
          });
        }
      }

      // Calculate discount
      const discount = promotion.calculateDiscount(orderAmount, items);

      res.json({
        success: true,
        message: 'Promotion code is valid',
        data: {
          promotion: {
            _id: promotion._id,
            name: promotion.name,
            code: promotion.code,
            type: promotion.type,
            discountValue: promotion.discountValue
          },
          discount: {
            amount: discount,
            formatted: `₫${discount.toLocaleString()}`,
            newTotal: Math.max(0, orderAmount - discount)
          },
          remainingUsage: promotion.remainingUsage
        }
      });
    } catch (error) {
      console.error('Error validating promotion code:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate promotion code',
        error: error.message
      });
    }
  },

  // Track promotion performance
  trackPromotionView: async (req, res) => {
    try {
      const { id } = req.params;

      const promotion = await Promotion.findOne({
        _id: new mongoose.Types.ObjectId(id),
        isActive: true
      });

      if (!promotion) {
        return res.status(404).json({
          success: false,
          message: 'Promotion not found'
        });
      }

      promotion.performance.views += 1;
      await promotion.save();

      res.json({
        success: true,
        message: 'Promotion view tracked'
      });
    } catch (error) {
      console.error('Error tracking promotion view:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to track promotion view',
        error: error.message
      });
    }
  },

  // Get promotion analytics
  getPromotionAnalytics: async (req, res) => {
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

      const analytics = await Promotion.aggregate([
        {
          $match: {
            isActive: true,
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            totalPromotions: { $sum: 1 },
            activePromotions: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            totalViews: { $sum: '$performance.views' },
            totalClicks: { $sum: '$performance.clicks' },
            totalConversions: { $sum: '$performance.conversions' },
            totalRevenue: { $sum: '$performance.revenue' },
            averageConversionRate: { $avg: '$performance.conversionRate' }
          }
        }
      ]);

      // Get top performing promotions
      const topPromotions = await Promotion.find({
        isActive: true,
        createdAt: { $gte: startDate, $lte: endDate }
      })
      .sort({ 'performance.conversions': -1 })
      .limit(5)
      .select('name code performance currentUsage.totalUsed');

      res.json({
        success: true,
        data: {
          summary: analytics[0] || {},
          topPromotions,
          period: {
            startDate,
            endDate,
            days: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
          }
        }
      });
    } catch (error) {
      console.error('Error getting promotion analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get promotion analytics',
        error: error.message
      });
    }
  }
};

module.exports = promotionController;
