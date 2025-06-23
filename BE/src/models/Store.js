const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const storeRevenueSchema = new mongoose.Schema({
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  averageOrderValue: {
    type: Number,
    default: 0
  },
  topProducts: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    productName: String,
    quantity: Number,
    revenue: Number
  }],
  paymentMethods: {
    cash: { type: Number, default: 0 },
    credit_card: { type: Number, default: 0 },
    bank_transfer: { type: Number, default: 0 },
    e_wallet: { type: Number, default: 0 }
  },
  customerMetrics: {
    newCustomers: { type: Number, default: 0 },
    returningCustomers: { type: Number, default: 0 },
    totalCustomers: { type: Number, default: 0 }
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

const storeStaffSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  position: {
    type: String,
    enum: ['manager', 'assistant_manager', 'sales_staff', 'cashier', 'security', 'cleaner'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  permissions: [{
    type: String,
    enum: ['manage_orders', 'manage_inventory', 'manage_staff', 'view_reports', 'handle_returns', 'manage_promotions']
  }],
  workSchedule: {
    monday: { start: String, end: String, isWorkingDay: Boolean },
    tuesday: { start: String, end: String, isWorkingDay: Boolean },
    wednesday: { start: String, end: String, isWorkingDay: Boolean },
    thursday: { start: String, end: String, isWorkingDay: Boolean },
    friday: { start: String, end: String, isWorkingDay: Boolean },
    saturday: { start: String, end: String, isWorkingDay: Boolean },
    sunday: { start: String, end: String, isWorkingDay: Boolean }
  }
});

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: 10
  },
  address: {
    street: {
      type: String,
      required: true,
      maxlength: 200
    },
    district: {
      type: String,
      required: true,
      maxlength: 100
    },
    city: {
      type: String,
      required: true,
      maxlength: 100
    },
    postalCode: {
      type: String,
      maxlength: 20
    },
    country: {
      type: String,
      default: 'Vietnam'
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  contact: {
    phone: {
      type: String,
      required: true,
      match: [/^(\+84|0)(3|5|7|8|9)[0-9]{8}$/, 'Invalid Vietnamese phone number']
    },
    email: {
      type: String,
      required: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
    },
    fax: String
  },
  operatingHours: {
    monday: { open: String, close: String, isOpen: Boolean },
    tuesday: { open: String, close: String, isOpen: Boolean },
    wednesday: { open: String, close: String, isOpen: Boolean },
    thursday: { open: String, close: String, isOpen: Boolean },
    friday: { open: String, close: String, isOpen: Boolean },
    saturday: { open: String, close: String, isOpen: Boolean },
    sunday: { open: String, close: String, isOpen: Boolean }
  },
  storeType: {
    type: String,
    enum: ['flagship', 'branch', 'outlet', 'warehouse'],
    default: 'branch'
  },
  size: {
    totalArea: Number, // m²
    salesFloor: Number, // m²
    warehouse: Number, // m²
    parking: Number // số chỗ đậu xe
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  staff: [storeStaffSchema],
  facilities: [{
    type: String,
    enum: ['air_conditioning', 'parking', 'elevator', 'wifi', 'security_camera', 'fire_safety', 'disabled_access']
  }],
  services: [{
    type: String,
    enum: ['delivery', 'installation', 'warranty_service', 'consultation', 'after_sales_support', 'custom_orders']
  }],
  inventory: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  monthlyRevenue: [storeRevenueSchema],
  performance: {
    totalRevenue: {
      type: Number,
      default: 0
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    },
    customerSatisfaction: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    monthlyTarget: {
      type: Number,
      default: 0
    },
    achievementRate: {
      type: Number,
      default: 0
    }
  },
  settings: {
    timezone: {
      type: String,
      default: 'Asia/Ho_Chi_Minh'
    },
    currency: {
      type: String,
      default: 'VND'
    },
    language: {
      type: String,
      default: 'vi'
    },
    taxRate: {
      type: Number,
      default: 10,
      min: 0,
      max: 100
    },
    allowOnlineOrders: {
      type: Boolean,
      default: true
    },
    allowReservations: {
      type: Boolean,
      default: true
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'under_renovation', 'temporarily_closed', 'permanently_closed'],
    default: 'active'
  },
  establishedDate: {
    type: Date,
    required: true
  },
  lastInspection: Date,
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

// Virtual for full address
storeSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.district}, ${this.address.city}`;
});

// Virtual for current operating status
storeSchema.virtual('isCurrentlyOpen').get(function() {
  if (this.status !== 'active') return false;
  
  const now = new Date();
  const today = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const todayHours = this.operatingHours[today];
  if (!todayHours || !todayHours.isOpen) return false;
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
});

// Pre-save middleware
storeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Update performance calculations
  if (this.performance.totalOrders > 0) {
    this.performance.averageOrderValue = this.performance.totalRevenue / this.performance.totalOrders;
  }
  
  // Calculate achievement rate
  if (this.performance.monthlyTarget > 0) {
    this.performance.achievementRate = (this.performance.totalRevenue / this.performance.monthlyTarget) * 100;
  }
  
  next();
});

// Static method to find nearby stores
storeSchema.statics.findNearby = function(latitude, longitude, maxDistance = 10000) {
  return this.find({
    'address.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    },
    status: 'active',
    isActive: true
  });
};

// Instance method to update monthly revenue
storeSchema.methods.updateMonthlyRevenue = function(month, year, revenueData) {
  const existingIndex = this.monthlyRevenue.findIndex(
    r => r.month === month && r.year === year
  );
  
  if (existingIndex >= 0) {
    this.monthlyRevenue[existingIndex] = { ...this.monthlyRevenue[existingIndex], ...revenueData };
  } else {
    this.monthlyRevenue.push({ month, year, ...revenueData });
  }
  
  // Update total performance
  this.performance.totalRevenue = this.monthlyRevenue.reduce((sum, rev) => sum + rev.totalRevenue, 0);
  this.performance.totalOrders = this.monthlyRevenue.reduce((sum, rev) => sum + rev.totalOrders, 0);
  
  return this.save();
};

// Instance method to add staff member
storeSchema.methods.addStaff = function(staffData) {
  this.staff.push(staffData);
  return this.save();
};

// Instance method to update inventory
storeSchema.methods.updateInventory = function(productId, quantity) {
  const existingIndex = this.inventory.findIndex(
    item => item.productId.toString() === productId.toString()
  );
  
  if (existingIndex >= 0) {
    this.inventory[existingIndex].quantity = quantity;
    this.inventory[existingIndex].lastUpdated = new Date();
  } else {
    this.inventory.push({
      productId,
      quantity,
      lastUpdated: new Date()
    });
  }
  
  return this.save();
};

// Add indexes for better performance
storeSchema.index({ code: 1 });
storeSchema.index({ 'address.city': 1 });
storeSchema.index({ status: 1 });
storeSchema.index({ storeType: 1 });
storeSchema.index({ 'address.coordinates': '2dsphere' });
storeSchema.index({ isActive: 1 });
storeSchema.index({ createdAt: -1 });

storeSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Store', storeSchema);
