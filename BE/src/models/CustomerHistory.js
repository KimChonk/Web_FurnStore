const mongoose = require('mongoose');

const customerHistorySchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  orderDate: {
    type: Date,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'bank_transfer', 'e_wallet'],
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    }
  }],
  shippingAddress: {
    street: String,
    city: String,
    district: String,
    ward: String,
    zipCode: String,
    phone: String,
    recipientName: String
  },
  notes: String,
  deliveryDate: Date,
  returnDate: Date,
  returnReason: String
}, {
  timestamps: true
});

// Indexes for better query performance
customerHistorySchema.index({ customerId: 1, orderDate: -1 });
customerHistorySchema.index({ customerId: 1, status: 1 });
customerHistorySchema.index({ orderDate: -1 });

module.exports = mongoose.model('CustomerHistory', customerHistorySchema);
