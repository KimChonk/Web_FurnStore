const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const CustomerHistory = require('../models/CustomerHistory');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const profile = await UserProfile.findOne({ userId: req.user.id });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        profile
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

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const {
      personalInfo,
      contactInfo,
      addresses,
      preferences,
      socialLinks,
      bankInfo
    } = req.body;

    // Update basic user info if provided
    const userUpdateFields = {};
    if (req.body.name) userUpdateFields.name = req.body.name;
    if (req.body.phone) userUpdateFields.phone = req.body.phone;
    if (req.body.avatar) userUpdateFields.avatar = req.body.avatar;

    if (Object.keys(userUpdateFields).length > 0) {
      await User.findByIdAndUpdate(req.user.id, userUpdateFields, {
        new: true,
        runValidators: true
      });
    }

    // Update or create user profile
    const profileUpdateFields = {};
    if (personalInfo) profileUpdateFields.personalInfo = personalInfo;
    if (contactInfo) profileUpdateFields.contactInfo = contactInfo;
    if (addresses) profileUpdateFields.addresses = addresses;
    if (preferences) profileUpdateFields.preferences = preferences;
    if (socialLinks) profileUpdateFields.socialLinks = socialLinks;
    if (bankInfo) profileUpdateFields.bankInfo = bankInfo;

    let profile = await UserProfile.findOneAndUpdate(
      { userId: req.user.id },
      profileUpdateFields,
      { new: true, upsert: true, runValidators: true }
    );

    const updatedUser = await User.findById(req.user.id).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser,
        profile
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

// @desc    Get customer purchase history
// @route   GET /api/users/history
// @access  Private
const getCustomerHistory = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      sortBy = 'orderDate',
      sortOrder = 'desc'
    } = req.query;

    const query = { customerId: req.user.id };

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.orderDate = {};
      if (startDate) query.orderDate.$gte = new Date(startDate);
      if (endDate) query.orderDate.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get purchase history
    const history = await CustomerHistory.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('items.productId', 'name images category')
      .lean();

    // Get total count
    const total = await CustomerHistory.countDocuments(query);

    // Calculate statistics
    const stats = await CustomerHistory.aggregate([
      { $match: { customerId: req.user.id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    const statistics = stats.length > 0 ? stats[0] : {
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0
    };

    res.status(200).json({
      success: true,
      data: {
        history,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        statistics
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

// @desc    Get customer statistics
// @route   GET /api/users/statistics
// @access  Private
const getCustomerStatistics = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    // Monthly spending statistics
    const monthlyStats = await CustomerHistory.aggregate([
      {
        $match: {
          customerId: req.user.id,
          orderDate: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$orderDate' },
          totalAmount: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Status distribution
    const statusStats = await CustomerHistory.aggregate([
      { $match: { customerId: req.user.id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top categories
    const categoryStats = await CustomerHistory.aggregate([
      { $match: { customerId: req.user.id } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          totalSpent: { $sum: '$items.totalPrice' },
          itemCount: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        monthlyStats,
        statusStats,
        categoryStats
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

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      isActive,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get users
    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await User.countDocuments(query);

    // Get role statistics
    const roleStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        roleStats
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

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    const profile = await UserProfile.findOne({ userId: req.params.id });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user statistics if customer
    let statistics = null;
    if (user.role === 'customer') {
      const stats = await CustomerHistory.aggregate([
        { $match: { customerId: user._id } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$totalAmount' },
            averageOrderValue: { $avg: '$totalAmount' }
          }
        }
      ]);
      statistics = stats.length > 0 ? stats[0] : null;
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        profile,
        statistics
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

// @desc    Create staff account (Admin only)
// @route   POST /api/users/staff
// @access  Private/Admin
const createStaffAccount = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      employmentInfo
    } = req.body;

    // Validate role
    const allowedRoles = ['delivery', 'warehouse_manager', 'customer_service', 'admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role for staff account'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      isEmailVerified: true // Staff accounts are verified by default
    });

    // Create user profile with employment info
    if (employmentInfo) {
      await UserProfile.create({
        userId: user._id,
        employmentInfo: {
          ...employmentInfo,
          supervisor: req.user.id // Set creator as supervisor
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Staff account created successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive
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

// @desc    Update user by ID (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUserById = async (req, res) => {
  try {
    const {
      name,
      email,
      role,
      phone,
      isActive,
      employmentInfo
    } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user fields
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (role) updateFields.role = role;
    if (phone) updateFields.phone = phone;
    if (isActive !== undefined) updateFields.isActive = isActive;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    // Update employment info if provided
    if (employmentInfo) {
      await UserProfile.findOneAndUpdate(
        { userId: req.params.id },
        { $set: { employmentInfo } },
        { upsert: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete user by ID (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete by deactivating account
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User account deactivated successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getCustomerHistory,
  getCustomerStatistics,
  getAllUsers,
  getUserById,
  createStaffAccount,
  updateUserById,
  deleteUserById
};
