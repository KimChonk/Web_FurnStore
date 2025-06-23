const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const inventoryTransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['in', 'out', 'adjustment', 'damaged', 'returned'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: false
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const damagedReportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    unique: true,
    required: true
  },
  damageType: {
    type: String,
    enum: ['manufacturing_defect', 'shipping_damage', 'warehouse_damage', 'customer_return', 'wear_and_tear'],
    required: true
  },
  severity: {
    type: String,
    enum: ['minor', 'major', 'total_loss'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  photos: [{
    url: String,
    description: String
  }],
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['reported', 'investigating', 'confirmed', 'resolved', 'disposed'],
    default: 'reported'
  },
  resolution: {
    action: {
      type: String,
      enum: ['repair', 'return_to_supplier', 'dispose', 'sell_as_defective', 'no_action']
    },
    notes: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date
  },
  financialImpact: {
    estimatedLoss: {
      type: Number,
      default: 0
    },
    recoveredAmount: {
      type: Number,
      default: 0
    }
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

const inventorySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    unique: true
  },
  sku: {
    type: String,
    required: true,
    unique: true
  },
  currentStock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  reservedStock: {
    type: Number,
    default: 0,
    min: 0
  },
  availableStock: {
    type: Number,
    default: 0,
    min: 0
  },
  minStockLevel: {
    type: Number,
    required: true,
    default: 10
  },
  maxStockLevel: {
    type: Number,
    required: true,
    default: 1000
  },
  reorderPoint: {
    type: Number,
    required: true,
    default: 20
  },
  warehouseLocation: {
    section: String,
    row: String,
    shelf: String,
    bin: String
  },
  lastRestocked: Date,
  lastSold: Date,
  costPrice: {
    type: Number,
    required: true
  },
  transactions: [inventoryTransactionSchema],
  damagedReports: [damagedReportSchema],
  stockAlerts: [{
    type: {
      type: String,
      enum: ['low_stock', 'overstock', 'reorder_needed', 'damaged_stock']
    },
    message: String,
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalValue: {
    type: Number,
    default: 0
  },
  turnoverRate: {
    type: Number,
    default: 0
  },
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

// Calculate available stock automatically
inventorySchema.virtual('calculatedAvailableStock').get(function() {
  return Math.max(0, this.currentStock - this.reservedStock);
});

// Update total value when stock or cost changes
inventorySchema.pre('save', function(next) {
  this.availableStock = Math.max(0, this.currentStock - this.reservedStock);
  this.totalValue = this.currentStock * this.costPrice;
  this.updatedAt = new Date();
  
  // Check for stock alerts
  this.stockAlerts = this.stockAlerts.filter(alert => alert.isActive);
  
  // Low stock alert
  if (this.currentStock <= this.reorderPoint) {
    const hasLowStockAlert = this.stockAlerts.some(alert => alert.type === 'low_stock');
    if (!hasLowStockAlert) {
      this.stockAlerts.push({
        type: 'low_stock',
        message: `Stock level (${this.currentStock}) is at or below reorder point (${this.reorderPoint})`
      });
    }
  }
  
  // Overstock alert
  if (this.currentStock > this.maxStockLevel) {
    const hasOverstockAlert = this.stockAlerts.some(alert => alert.type === 'overstock');
    if (!hasOverstockAlert) {
      this.stockAlerts.push({
        type: 'overstock',
        message: `Stock level (${this.currentStock}) exceeds maximum (${this.maxStockLevel})`
      });
    }
  }
  
  next();
});

// Add indexes for better performance
inventorySchema.index({ productId: 1 });
inventorySchema.index({ sku: 1 });
inventorySchema.index({ currentStock: 1 });
inventorySchema.index({ 'warehouseLocation.section': 1 });
inventorySchema.index({ isActive: 1 });
inventorySchema.index({ createdAt: -1 });

// Generate unique report ID for damaged products
damagedReportSchema.pre('save', function(next) {
  if (!this.reportId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 5);
    this.reportId = `DMG-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

inventorySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Inventory', inventorySchema);
