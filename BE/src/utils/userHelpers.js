const UserProfile = require('../models/UserProfile');
const CustomerHistory = require('../models/CustomerHistory');

// Helper function to calculate membership level based on total spending
const calculateMembershipLevel = (totalSpent) => {
  if (totalSpent >= 100000000) return 'platinum'; // 100M VND
  if (totalSpent >= 50000000) return 'gold';      // 50M VND
  if (totalSpent >= 20000000) return 'silver';    // 20M VND
  return 'bronze';
};

// Helper function to update user statistics
const updateUserStatistics = async (userId) => {
  try {
    // Calculate statistics from customer history
    const stats = await CustomerHistory.aggregate([
      { $match: { customerId: userId } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' },
          lastOrderDate: { $max: '$orderDate' }
        }
      }
    ]);

    if (stats.length > 0) {
      const { totalOrders, totalSpent, averageOrderValue, lastOrderDate } = stats[0];
      const membershipLevel = calculateMembershipLevel(totalSpent);
      const loyaltyPoints = Math.floor(totalSpent / 1000); // 1 point per 1000 VND

      // Get favorite categories
      const categoryStats = await CustomerHistory.aggregate([
        { $match: { customerId: userId } },
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
            totalSpent: { $sum: '$items.totalPrice' }
          }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 3 }
      ]);

      const favoriteCategories = categoryStats.map(cat => cat._id);

      // Update user profile statistics
      await UserProfile.findOneAndUpdate(
        { userId },
        {
          $set: {
            'statistics.totalOrders': totalOrders,
            'statistics.totalSpent': totalSpent,
            'statistics.averageOrderValue': averageOrderValue,
            'statistics.lastOrderDate': lastOrderDate,
            'statistics.favoriteCategories': favoriteCategories,
            'statistics.loyaltyPoints': loyaltyPoints,
            'statistics.membershipLevel': membershipLevel
          }
        },
        { upsert: true }
      );

      return {
        totalOrders,
        totalSpent,
        averageOrderValue,
        lastOrderDate,
        favoriteCategories,
        loyaltyPoints,
        membershipLevel
      };
    }

    return null;
  } catch (error) {
    console.error('Error updating user statistics:', error);
    throw error;
  }
};

// Helper function to sanitize user data for API response
const sanitizeUserData = (user, includeEmail = false) => {
  const sanitized = {
    _id: user._id,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  if (includeEmail) {
    sanitized.email = user.email;
    sanitized.phone = user.phone;
  }

  return sanitized;
};

// Helper function to generate user activity report
const generateUserActivityReport = async (userId, startDate, endDate) => {
  try {
    const matchCondition = { customerId: userId };

    if (startDate || endDate) {
      matchCondition.orderDate = {};
      if (startDate) matchCondition.orderDate.$gte = new Date(startDate);
      if (endDate) matchCondition.orderDate.$lte = new Date(endDate);
    }

    // Activity summary
    const activitySummary = await CustomerHistory.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    // Monthly breakdown
    const monthlyActivity = await CustomerHistory.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: {
            year: { $year: '$orderDate' },
            month: { $month: '$orderDate' }
          },
          orderCount: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Product preferences
    const productPreferences = await CustomerHistory.aggregate([
      { $match: matchCondition },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalSpent: { $sum: '$items.totalPrice' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]);

    return {
      summary: activitySummary[0] || {},
      monthlyActivity,
      productPreferences
    };
  } catch (error) {
    console.error('Error generating user activity report:', error);
    throw error;
  }
};

// Helper function to validate user permissions for data access
const validateUserDataAccess = (requestingUser, targetUserId) => {
  // Admin can access any user's data
  if (requestingUser.role === 'admin') {
    return true;
  }

  // Customer service can access customer data
  if (requestingUser.role === 'customer_service') {
    return true;
  }

  // Users can only access their own data
  return requestingUser.id === targetUserId;
};

// Helper function to format address for display
const formatAddress = (address) => {
  if (!address) return '';
  
  const parts = [
    address.street,
    address.ward,
    address.district,
    address.city
  ].filter(Boolean);
  
  return parts.join(', ');
};

// Helper function to calculate user engagement score
const calculateEngagementScore = async (userId) => {
  try {
    const profile = await UserProfile.findOne({ userId });
    if (!profile) return 0;

    const stats = profile.statistics;
    let score = 0;

    // Order frequency (40%)
    if (stats.totalOrders > 0) {
      const daysSinceJoin = Math.max(1, Math.floor((Date.now() - profile.createdAt) / (1000 * 60 * 60 * 24)));
      const orderFrequency = stats.totalOrders / daysSinceJoin;
      score += Math.min(40, orderFrequency * 1000);
    }

    // Spending level (30%)
    const spendingLevel = Math.min(30, (stats.totalSpent || 0) / 1000000); // 1M VND = 1 point

    // Profile completeness (20%)
    let completeness = 0;
    if (profile.personalInfo?.firstName) completeness += 5;
    if (profile.personalInfo?.lastName) completeness += 5;
    if (profile.personalInfo?.dateOfBirth) completeness += 2;
    if (profile.contactInfo?.primaryPhone) completeness += 3;
    if (profile.addresses?.length > 0) completeness += 5;

    // Loyalty (10%)
    const daysSinceLastOrder = stats.lastOrderDate ? 
      Math.floor((Date.now() - stats.lastOrderDate) / (1000 * 60 * 60 * 24)) : 365;
    const loyalty = Math.max(0, 10 - (daysSinceLastOrder / 30)); // Decrease by 1 per month

    return Math.round(score + spendingLevel + completeness + loyalty);
  } catch (error) {
    console.error('Error calculating engagement score:', error);
    return 0;
  }
};

module.exports = {
  calculateMembershipLevel,
  updateUserStatistics,
  sanitizeUserData,
  generateUserActivityReport,
  validateUserDataAccess,
  formatAddress,
  calculateEngagementScore
};
