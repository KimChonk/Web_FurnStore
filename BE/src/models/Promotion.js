const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const promotionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  code: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: 20
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y', 'bundle'],
    required: true
  },
  discountValue: {
    type: Number,
    required: function() {
      return ['percentage', 'fixed_amount'].includes(this.type);
    },
    min: 0
  },
  maxDiscountAmount: {
    type: Number,
    min: 0
  },
  minOrderAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  applicableProducts: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }
  }],
  targetCustomers: {
    type: {
      type: String,
      enum: ['all', 'new_customers', 'returning_customers', 'vip_customers', 'specific_customers'],
      default: 'all'
    },
    customerIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    customerTiers: [{
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum']
    }]
  },
  usageLimit: {
    totalLimit: {
      type: Number,
      min: 1
    },
    perCustomerLimit: {
      type: Number,
      default: 1,
      min: 1
    }
  },
  currentUsage: {
    totalUsed: {
      type: Number,
      default: 0
    },
    customerUsage: [{
      customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      usageCount: {
        type: Number,
        default: 0
      },
      lastUsed: Date
    }]
  },
  validity: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    timezone: {
      type: String,
      default: 'Asia/Ho_Chi_Minh'
    }
  },
  conditions: {
    dayOfWeek: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    timeOfDay: {
      startTime: String, // HH:mm format
      endTime: String    // HH:mm format
    },
    excludedDates: [Date],
    combinableWithOtherPromotions: {
      type: Boolean,
      default: false
    }
  },
  buyXGetY: {
    buyQuantity: Number,
    getQuantity: Number,
    getFreeProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }
  },
  bundleProducts: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      default: 1
    },
    discountedPrice: Number
  }],
  display: {
    isVisible: {
      type: Boolean,
      default: true
    },
    featuredPromotion: {
      type: Boolean,
      default: false
    },
    displayOrder: {
      type: Number,
      default: 0
    },
    bannerImage: String,
    badgeText: String,
    highlightColor: {
      type: String,
      default: '#ff6b6b'
    }
  },
  performance: {
    views: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    conversions: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'expired', 'cancelled'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  notes: String,
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for checking if promotion is currently valid
promotionSchema.virtual('isCurrentlyValid').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         this.validity.startDate <= now && 
         this.validity.endDate >= now &&
         this.isActive;
});

// Virtual for remaining usage
promotionSchema.virtual('remainingUsage').get(function() {
  if (!this.usageLimit.totalLimit) return null;
  return Math.max(0, this.usageLimit.totalLimit - this.currentUsage.totalUsed);
});

// Pre-save middleware
promotionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Auto-generate promotion code if not provided
  if (!this.code && this.type !== 'bundle') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 5);
    this.code = `PROMO${timestamp}${random}`.toUpperCase();
  }
  
  // Update status based on dates
  const now = new Date();
  if (this.validity.endDate < now && this.status === 'active') {
    this.status = 'expired';
  }
  
  // Calculate conversion rate
  if (this.performance.clicks > 0) {
    this.performance.conversionRate = (this.performance.conversions / this.performance.clicks) * 100;
  }
  
  next();
});

// Static method to get active promotions
promotionSchema.statics.getActivePromotions = function() {
  const now = new Date();
  return this.find({
    status: 'active',
    isActive: true,
    'validity.startDate': { $lte: now },
    'validity.endDate': { $gte: now }
  }).sort({ 'display.displayOrder': 1, createdAt: -1 });
};

// Instance method to check if promotion is applicable to customer
promotionSchema.methods.isApplicableToCustomer = function(customerId) {
  if (this.targetCustomers.type === 'all') return true;
  if (this.targetCustomers.type === 'specific_customers') {
    return this.targetCustomers.customerIds.includes(customerId);
  }
  // Additional logic for customer types can be added here
  return true;
};

// Instance method to calculate discount
promotionSchema.methods.calculateDiscount = function(orderAmount, items = []) {
  if (!this.isCurrentlyValid) return 0;
  
  let discount = 0;
  
  switch (this.type) {
    case 'percentage':
      discount = (orderAmount * this.discountValue) / 100;
      if (this.maxDiscountAmount) {
        discount = Math.min(discount, this.maxDiscountAmount);
      }
      break;
      
    case 'fixed_amount':
      discount = Math.min(this.discountValue, orderAmount);
      break;
      
    case 'free_shipping':
      // This would need to be calculated based on shipping cost
      discount = 0; // Placeholder
      break;
      
    default:
      discount = 0;
  }
  
  return Math.max(0, discount);
};

// Add indexes
promotionSchema.index({ code: 1 });
promotionSchema.index({ status: 1 });
promotionSchema.index({ 'validity.startDate': 1, 'validity.endDate': 1 });
promotionSchema.index({ 'display.featuredPromotion': 1 });
promotionSchema.index({ type: 1 });
promotionSchema.index({ isActive: 1 });
promotionSchema.index({ createdAt: -1 });

promotionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Promotion', promotionSchema);
