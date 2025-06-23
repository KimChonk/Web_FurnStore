const Store = require('../models/Store');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

const storeController = {
  // Get all stores with filtering
  getStores: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        city,
        storeType,
        status,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const query = { isActive: true };

      // Search functionality
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        query.$or = [
          { name: searchRegex },
          { code: searchRegex },
          { 'address.street': searchRegex }
        ];
      }

      // Filter by city
      if (city) {
        query['address.city'] = new RegExp(city, 'i');
      }

      // Filter by store type
      if (storeType) {
        query.storeType = storeType;
      }

      // Filter by status
      if (status) {
        query.status = status;
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
        populate: [
          {
            path: 'manager',
            select: 'name email phone'
          },
          {
            path: 'staff.staffId',
            select: 'name email'
          }
        ]
      };

      const result = await Store.paginate(query, options);

      // Add computed fields
      const storesWithStatus = result.docs.map(store => {
        const storeObj = store.toObject();
        storeObj.fullAddress = store.fullAddress;
        storeObj.isCurrentlyOpen = store.isCurrentlyOpen;
        storeObj.activeStaffCount = store.staff.filter(s => s.isActive).length;
        return storeObj;
      });

      res.json({
        success: true,
        data: {
          stores: storesWithStatus,
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
      console.error('Error getting stores:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get stores',
        error: error.message
      });
    }
  },

  // Create new store
  createStore: async (req, res) => {
    try {
      const {
        name,
        code,
        address,
        contact,
        operatingHours,
        storeType,
        size,
        managerId,
        facilities,
        services,
        settings,
        establishedDate,
        notes
      } = req.body;

      // Check if store code already exists
      const existingStore = await Store.findOne({ code: code.toUpperCase() });
      if (existingStore) {
        return res.status(400).json({
          success: false,
          message: 'Store code already exists'
        });
      }

      // Validate manager if provided
      if (managerId) {
        const manager = await User.findById(managerId);
        if (!manager) {
          return res.status(404).json({
            success: false,
            message: 'Manager not found'
          });
        }
        
        if (!['admin', 'staff'].includes(manager.role)) {
          return res.status(400).json({
            success: false,
            message: 'Manager must be admin or staff role'
          });
        }
      }

      const store = new Store({
        name,
        code: code.toUpperCase(),
        address,
        contact,
        operatingHours,
        storeType,
        size,
        manager: managerId,
        facilities,
        services,
        settings,
        establishedDate,
        notes,
        status: 'active'
      });

      await store.save();

      const populatedStore = await Store.findById(store._id)
        .populate('manager', 'name email phone');

      res.status(201).json({
        success: true,
        message: 'Store created successfully',
        data: populatedStore
      });
    } catch (error) {
      console.error('Error creating store:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create store',
        error: error.message
      });
    }
  },

  // Get single store
  getStoreById: async (req, res) => {
    try {
      const { id } = req.params;

      const store = await Store.findOne({
        _id: new mongoose.Types.ObjectId(id),
        isActive: true
      })
      .populate('manager', 'name email phone')
      .populate('staff.staffId', 'name email phone')
      .populate('inventory.productId', 'name sku price');

      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }

      const storeObj = store.toObject();
      storeObj.fullAddress = store.fullAddress;
      storeObj.isCurrentlyOpen = store.isCurrentlyOpen;
      storeObj.activeStaffCount = store.staff.filter(s => s.isActive).length;

      res.json({
        success: true,
        data: storeObj
      });
    } catch (error) {
      console.error('Error getting store:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get store',
        error: error.message
      });
    }
  },

  // Update store
  updateStore: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const store = await Store.findOne({
        _id: new mongoose.Types.ObjectId(id),
        isActive: true
      });

      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }

      // Check if code is being changed and is unique
      if (updates.code && updates.code !== store.code) {
        const existingStore = await Store.findOne({
          code: updates.code.toUpperCase(),
          _id: { $ne: store._id }
        });

        if (existingStore) {
          return res.status(400).json({
            success: false,
            message: 'Store code already exists'
          });
        }
        updates.code = updates.code.toUpperCase();
      }

      // Validate manager if being updated
      if (updates.managerId) {
        const manager = await User.findById(updates.managerId);
        if (!manager || !['admin', 'staff'].includes(manager.role)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid manager'
          });
        }
        updates.manager = updates.managerId;
        delete updates.managerId;
      }

      Object.assign(store, updates);
      await store.save();

      const updatedStore = await Store.findById(store._id)
        .populate('manager', 'name email phone')
        .populate('staff.staffId', 'name email phone');

      res.json({
        success: true,
        message: 'Store updated successfully',
        data: updatedStore
      });
    } catch (error) {
      console.error('Error updating store:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update store',
        error: error.message
      });
    }
  },

  // Delete store (soft delete)
  deleteStore: async (req, res) => {
    try {
      const { id } = req.params;

      const store = await Store.findOne({
        _id: new mongoose.Types.ObjectId(id),
        isActive: true
      });

      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }

      store.isActive = false;
      store.status = 'permanently_closed';
      await store.save();

      res.json({
        success: true,
        message: 'Store deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting store:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete store',
        error: error.message
      });
    }
  },

  // Get store revenue
  getStoreRevenue: async (req, res) => {
    try {
      const { id } = req.params;
      const { year, month } = req.query;

      const store = await Store.findOne({
        _id: new mongoose.Types.ObjectId(id),
        isActive: true
      });

      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }

      let revenueQuery = { storeId: store._id };
      
      if (year) {
        revenueQuery.year = parseInt(year);
      }
      
      if (month) {
        revenueQuery.month = parseInt(month);
      }

      // Get revenue data from monthly revenue records
      let revenueData;
      
      if (month && year) {
        // Get specific month data
        revenueData = store.monthlyRevenue.find(
          r => r.month === parseInt(month) && r.year === parseInt(year)
        );
        
        if (!revenueData) {
          revenueData = {
            month: parseInt(month),
            year: parseInt(year),
            totalRevenue: 0,
            totalOrders: 0,
            averageOrderValue: 0,
            topProducts: [],
            paymentMethods: {},
            customerMetrics: {}
          };
        }
      } else if (year) {
        // Get all months for the year
        revenueData = store.monthlyRevenue.filter(r => r.year === parseInt(year));
      } else {
        // Get current year data
        const currentYear = new Date().getFullYear();
        revenueData = store.monthlyRevenue.filter(r => r.year === currentYear);
      }

      res.json({
        success: true,
        data: {
          store: {
            _id: store._id,
            name: store.name,
            code: store.code
          },
          revenue: revenueData,
          performance: store.performance
        }
      });
    } catch (error) {
      console.error('Error getting store revenue:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get store revenue',
        error: error.message
      });
    }
  },

  // Update monthly revenue
  updateMonthlyRevenue: async (req, res) => {
    try {
      const { id } = req.params;
      const { month, year, revenueData } = req.body;

      const store = await Store.findOne({
        _id: new mongoose.Types.ObjectId(id),
        isActive: true
      });

      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }

      await store.updateMonthlyRevenue(month, year, revenueData);

      res.json({
        success: true,
        message: 'Monthly revenue updated successfully',
        data: store.monthlyRevenue.find(r => r.month === month && r.year === year)
      });
    } catch (error) {
      console.error('Error updating monthly revenue:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update monthly revenue',
        error: error.message
      });
    }
  },

  // Get monthly revenue statistics
  getMonthlyRevenueStats: async (req, res) => {
    try {
      const { storeId, year = new Date().getFullYear() } = req.query;

      let matchQuery = {};
      
      if (storeId) {
        matchQuery._id = new mongoose.Types.ObjectId(storeId);
      }
      
      matchQuery.isActive = true;

      const stats = await Store.aggregate([
        { $match: matchQuery },
        { $unwind: '$monthlyRevenue' },
        {
          $match: {
            'monthlyRevenue.year': parseInt(year)
          }
        },
        {
          $group: {
            _id: {
              storeId: '$_id',
              storeName: '$name',
              storeCode: '$code'
            },
            totalRevenue: { $sum: '$monthlyRevenue.totalRevenue' },
            totalOrders: { $sum: '$monthlyRevenue.totalOrders' },
            averageOrderValue: { $avg: '$monthlyRevenue.averageOrderValue' },
            monthlyData: {
              $push: {
                month: '$monthlyRevenue.month',
                revenue: '$monthlyRevenue.totalRevenue',
                orders: '$monthlyRevenue.totalOrders',
                avgOrderValue: '$monthlyRevenue.averageOrderValue'
              }
            }
          }
        },
        {
          $sort: { totalRevenue: -1 }
        }
      ]);

      // Get overall statistics
      const overallStats = await Store.aggregate([
        { $match: { isActive: true } },
        { $unwind: '$monthlyRevenue' },
        {
          $match: {
            'monthlyRevenue.year': parseInt(year)
          }
        },
        {
          $group: {
            _id: '$monthlyRevenue.month',
            totalRevenue: { $sum: '$monthlyRevenue.totalRevenue' },
            totalOrders: { $sum: '$monthlyRevenue.totalOrders' },
            storeCount: { $addToSet: '$_id' }
          }
        },
        {
          $project: {
            month: '$_id',
            totalRevenue: 1,
            totalOrders: 1,
            storeCount: { $size: '$storeCount' },
            averageOrderValue: {
              $cond: [
                { $gt: ['$totalOrders', 0] },
                { $divide: ['$totalRevenue', '$totalOrders'] },
                0
              ]
            }
          }
        },
        { $sort: { month: 1 } }
      ]);

      res.json({
        success: true,
        data: {
          year: parseInt(year),
          storeStats: stats,
          overallStats,
          summary: {
            totalStores: stats.length,
            totalRevenue: stats.reduce((sum, store) => sum + store.totalRevenue, 0),
            totalOrders: stats.reduce((sum, store) => sum + store.totalOrders, 0),
            topPerformingStore: stats[0] || null
          }
        }
      });
    } catch (error) {
      console.error('Error getting monthly revenue stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get monthly revenue statistics',
        error: error.message
      });
    }
  },

  // Add staff to store
  addStaff: async (req, res) => {
    try {
      const { id } = req.params;
      const { staffId, position, permissions, workSchedule, startDate } = req.body;

      const store = await Store.findOne({
        _id: new mongoose.Types.ObjectId(id),
        isActive: true
      });

      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }

      // Validate staff member
      const staff = await User.findById(staffId);
      if (!staff || !['staff', 'admin'].includes(staff.role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid staff member'
        });
      }

      // Check if staff is already in this store
      const existingStaff = store.staff.find(
        s => s.staffId.toString() === staffId && s.isActive
      );

      if (existingStaff) {
        return res.status(400).json({
          success: false,
          message: 'Staff member is already assigned to this store'
        });
      }

      const staffData = {
        staffId,
        position,
        permissions,
        workSchedule,
        startDate: startDate || new Date()
      };

      await store.addStaff(staffData);

      const updatedStore = await Store.findById(store._id)
        .populate('staff.staffId', 'name email phone');

      res.json({
        success: true,
        message: 'Staff added successfully',
        data: updatedStore.staff[updatedStore.staff.length - 1]
      });
    } catch (error) {
      console.error('Error adding staff:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add staff',
        error: error.message
      });
    }
  },

  // Update store inventory
  updateInventory: async (req, res) => {
    try {
      const { id } = req.params;
      const { productId, quantity } = req.body;

      const store = await Store.findOne({
        _id: new mongoose.Types.ObjectId(id),
        isActive: true
      });

      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }

      // Validate product
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      await store.updateInventory(productId, quantity);

      const updatedInventoryItem = store.inventory.find(
        item => item.productId.toString() === productId
      );

      res.json({
        success: true,
        message: 'Store inventory updated successfully',
        data: updatedInventoryItem
      });
    } catch (error) {
      console.error('Error updating store inventory:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update store inventory',
        error: error.message
      });
    }
  },

  // Find nearby stores
  findNearbyStores: async (req, res) => {
    try {
      const { latitude, longitude, maxDistance = 10000 } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
      }

      const stores = await Store.findNearby(
        parseFloat(latitude), 
        parseFloat(longitude), 
        parseInt(maxDistance)
      ).populate('manager', 'name phone');

      const storesWithDistance = stores.map(store => {
        const storeObj = store.toObject();
        storeObj.isCurrentlyOpen = store.isCurrentlyOpen;
        return storeObj;
      });

      res.json({
        success: true,
        data: {
          stores: storesWithDistance,
          searchCenter: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude)
          },
          maxDistance: parseInt(maxDistance)
        }
      });
    } catch (error) {
      console.error('Error finding nearby stores:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to find nearby stores',
        error: error.message
      });
    }
  }
};

module.exports = storeController;
