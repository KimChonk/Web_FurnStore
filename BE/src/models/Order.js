const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String
  }
});

const shippingAddressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  postalCode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true,
    default: 'Vietnam'
  },
  phone: {
    type: String,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [orderItemSchema],
  shippingAddress: {
    type: shippingAddressSchema,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cash_on_delivery', 'bank_transfer', 'credit_card', 'e_wallet'],
    default: 'cash_on_delivery'
  },
  paymentResult: {
    id: String,
    status: String,
    updateTime: String,
    emailAddress: String
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  deliveryPerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    required: true,
    enum: [
      'pending', 
      'confirmed', 
      'processing', 
      'shipped', 
      'out_for_delivery',
      'delivery_attempted',
      'delivered', 
      'delivery_failed',
      'delivery_refused',
      'address_verification_needed',
      'emergency_hold',
      'cancelled'
    ],
    default: 'pending'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  estimatedDelivery: {
    type: Date
  },
  tracking: {
    trackingNumber: String,
    carrier: String,
    trackingUrl: String
  },
  // Delivery Management Fields
  deliveryAttempts: [{
    attemptDate: { type: Date, required: true },
    status: { type: String, required: true },
    notes: String,
    deliveryPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    failureReason: String,
    estimatedRetry: Date
  }],
  deliveryConfirmation: {
    confirmedAt: Date,
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiverName: String,
    receiverPhone: String,
    deliveryNotes: String,
    signatureRequired: { type: Boolean, default: false },
    proofPhotos: [String]
  },
  deliveryFailures: [{
    reportedAt: { type: Date, required: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    failureReason: { type: String, required: true },
    failureDetails: { type: String, required: true },
    customerNotAvailable: { type: Boolean, default: false },
    incorrectAddress: { type: Boolean, default: false },
    refusedDelivery: { type: Boolean, default: false },
    estimatedRetry: Date,
    requiresAction: { type: Boolean, default: false }
  }],
  deliveryPhotos: [{
    filename: { type: String, required: true },
    originalName: String,
    path: { type: String, required: true },
    size: Number,
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    photoType: { 
      type: String, 
      enum: ['delivery_proof', 'package_condition', 'address_verification', 'incident_evidence'],
      default: 'delivery_proof'
    },
    description: String
  }],
  // Communication History
  communicationHistory: [{
    type: { 
      type: String, 
      enum: ['call', 'sms', 'email', 'chat', 'whatsapp'],
      required: true
    },
    method: { 
      type: String, 
      enum: ['outgoing', 'incoming'],
      required: true
    },
    message: { type: String, required: true },
    duration: Number, // For calls (in seconds)
    outcome: { 
      type: String, 
      enum: ['connected', 'no_answer', 'busy', 'voicemail', 'delivered', 'failed', 'read', 'sent', 'initiated', 'completed'],
      required: true
    },
    timestamp: { type: Date, default: Date.now },
    initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    phoneNumber: String,
    phoneType: { 
      type: String, 
      enum: ['primary', 'alternate', 'shipping']
    },
    template: String, // SMS template used
    followUpRequired: { type: Boolean, default: false },
    followUpDate: Date
  }]
}, {
  timestamps: true
});

// Indexes
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ deliveryPerson: 1 });
orderSchema.index({ 'tracking.trackingNumber': 1 });

// Virtual for order number
orderSchema.virtual('orderNumber').get(function() {
  return `ORD-${this.createdAt.getFullYear()}-${String(this.createdAt.getMonth() + 1).padStart(2, '0')}-${this._id.toString().slice(-6).toUpperCase()}`;
});

// Pre save middleware to calculate total price
orderSchema.pre('save', function(next) {
  if (this.isModified('orderItems')) {
    const itemsPrice = this.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    this.totalPrice = itemsPrice + this.taxPrice + this.shippingPrice;
  }
  next();
});

// Methods
orderSchema.methods.markAsPaid = function(paymentResult) {
  this.isPaid = true;
  this.paidAt = Date.now();
  this.paymentResult = paymentResult;
  return this.save();
};

orderSchema.methods.markAsDelivered = function() {
  this.isDelivered = true;
  this.deliveredAt = Date.now();
  this.status = 'delivered';
  return this.save();
};

orderSchema.methods.updateStatus = function(status) {
  this.status = status;
  if (status === 'delivered') {
    this.isDelivered = true;
    this.deliveredAt = Date.now();
  }
  return this.save();
};

orderSchema.methods.assignDeliveryPerson = function(deliveryPersonId) {
  this.deliveryPerson = deliveryPersonId;
  return this.save();
};

// Static methods
orderSchema.statics.getOrderStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$totalPrice' }
      }
    }
  ]);
  return stats;
};

orderSchema.statics.getRevenueByMonth = async function(year = new Date().getFullYear()) {
  const stats = await this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        },
        isPaid: true
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        revenue: { $sum: '$totalPrice' },
        orderCount: { $sum: 1 }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);
  return stats;
};

orderSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Order', orderSchema);
