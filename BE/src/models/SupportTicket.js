const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ticketMessageSchema = new mongoose.Schema({
  messageId: {
    type: String,
    unique: true,
    required: true
  },
  sender: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: String,
    role: {
      type: String,
      enum: ['customer', 'support_agent', 'manager', 'admin'],
      required: true
    }
  },
  message: {
    type: String,
    required: true,
    maxlength: 2000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  attachments: [{
    filename: String,
    url: String,
    fileType: String,
    fileSize: Number
  }],
  isInternal: {
    type: Boolean,
    default: false
  },
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const escalationSchema = new mongoose.Schema({
  escalatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  escalatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true,
    maxlength: 500
  },
  level: {
    type: String,
    enum: ['supervisor', 'manager', 'director', 'emergency'],
    required: true
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  acknowledgedAt: Date,
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const feedbackSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 1000
  },
  aspects: {
    responseTime: { type: Number, min: 1, max: 5 },
    helpfulness: { type: Number, min: 1, max: 5 },
    professionalism: { type: Number, min: 1, max: 5 },
    knowledgeLevel: { type: Number, min: 1, max: 5 }
  },
  wouldRecommend: Boolean,
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

const supportTicketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  category: {
    type: String,
    enum: [
      'product_inquiry',
      'order_issue',
      'delivery_problem',
      'payment_issue',
      'warranty_claim',
      'return_request',
      'technical_support',
      'complaint',
      'suggestion',
      'emergency',
      'other'
    ],
    required: true
  },
  subcategory: {
    type: String,
    maxlength: 100
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent', 'emergency'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'pending_customer', 'pending_internal', 'resolved', 'closed', 'cancelled'],
    default: 'open'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: Date,
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  relatedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  },
  contactMethod: {
    type: String,
    enum: ['phone', 'email', 'chat', 'in_person', 'social_media'],
    default: 'email'
  },
  customerContact: {
    phone: String,
    email: String,
    preferredTime: String,
    preferredMethod: String
  },
  messages: [ticketMessageSchema],
  escalations: [escalationSchema],
  resolution: {
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolutionTime: Number, // minutes
    solution: {
      type: String,
      maxlength: 1000
    },
    actionsTaken: [{
      action: String,
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      performedAt: {
        type: Date,
        default: Date.now
      }
    }],
    customerSatisfied: Boolean,
    resolvedAt: Date
  },
  feedback: feedbackSchema,
  specialRequest: {
    isSpecial: {
      type: Boolean,
      default: false
    },
    requestType: {
      type: String,
      enum: ['custom_order', 'bulk_discount', 'payment_terms', 'special_delivery', 'vip_service', 'other']
    },
    approvalRequired: {
      type: Boolean,
      default: false
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    specialInstructions: String
  },
  emergencyAlert: {
    isEmergency: {
      type: Boolean,
      default: false
    },
    emergencyType: {
      type: String,
      enum: ['safety_issue', 'security_concern', 'major_complaint', 'media_attention', 'legal_issue', 'vip_customer']
    },
    alertSentTo: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      sentAt: {
        type: Date,
        default: Date.now
      },
      method: {
        type: String,
        enum: ['email', 'sms', 'phone', 'notification']
      }
    }],
    acknowledgedBy: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      acknowledgedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  sla: {
    responseTime: Number, // minutes
    resolutionTime: Number, // minutes
    responseDeadline: Date,
    resolutionDeadline: Date,
    responseStatus: {
      type: String,
      enum: ['on_time', 'overdue', 'escalated'],
      default: 'on_time'
    },
    resolutionStatus: {
      type: String,
      enum: ['on_time', 'overdue', 'escalated'],
      default: 'on_time'
    }
  },
  analytics: {
    firstResponseTime: Number, // minutes
    totalInteractions: {
      type: Number,
      default: 0
    },
    customerResponseTime: Number, // average minutes
    agentResponseTime: Number, // average minutes
    reopenCount: {
      type: Number,
      default: 0
    },
    escalationCount: {
      type: Number,
      default: 0
    }
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
  },
  closedAt: Date
});

// Generate unique ticket number
supportTicketSchema.pre('save', function(next) {
  if (!this.ticketNumber) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 5);
    this.ticketNumber = `TK-${timestamp}-${random}`.toUpperCase();
  }
  
  this.updatedAt = new Date();
  
  // Update analytics
  this.analytics.totalInteractions = this.messages.length;
  
  // Calculate SLA deadlines
  if (this.isNew) {
    const now = new Date();
    
    // Set response and resolution deadlines based on priority
    const slaMinutes = {
      emergency: { response: 15, resolution: 60 },
      urgent: { response: 60, resolution: 240 },
      high: { response: 120, resolution: 480 },
      medium: { response: 240, resolution: 960 },
      low: { response: 480, resolution: 1440 }
    };
    
    const sla = slaMinutes[this.priority];
    this.sla.responseDeadline = new Date(now.getTime() + sla.response * 60000);
    this.sla.resolutionDeadline = new Date(now.getTime() + sla.resolution * 60000);
  }
  
  // Update status based on deadlines
  const now = new Date();
  if (this.status === 'open' && this.sla.responseDeadline < now) {
    this.sla.responseStatus = 'overdue';
  }
  if (['open', 'in_progress'].includes(this.status) && this.sla.resolutionDeadline < now) {
    this.sla.resolutionStatus = 'overdue';
  }
  
  next();
});

// Generate unique message ID
ticketMessageSchema.pre('save', function(next) {
  if (!this.messageId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 4);
    this.messageId = `MSG-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Instance methods
supportTicketSchema.methods.addMessage = function(messageData) {
  this.messages.push(messageData);
  this.analytics.totalInteractions = this.messages.length;
  
  // Calculate first response time
  if (!this.analytics.firstResponseTime && messageData.sender.role !== 'customer') {
    const firstMessage = this.messages.find(msg => msg.sender.role === 'customer');
    if (firstMessage) {
      this.analytics.firstResponseTime = Math.round(
        (messageData.createdAt - firstMessage.createdAt) / (1000 * 60)
      );
    }
  }
  
  return this.save();
};

supportTicketSchema.methods.escalate = function(escalationData) {
  this.escalations.push(escalationData);
  this.analytics.escalationCount = this.escalations.length;
  
  // Update priority if escalated
  if (escalationData.urgency === 'critical') {
    this.priority = 'emergency';
  } else if (escalationData.urgency === 'high' && this.priority === 'medium') {
    this.priority = 'high';
  }
  
  return this.save();
};

supportTicketSchema.methods.resolve = function(resolutionData) {
  this.status = 'resolved';
  this.resolution = {
    ...resolutionData,
    resolvedAt: new Date()
  };
  
  // Calculate resolution time
  this.resolution.resolutionTime = Math.round(
    (new Date() - this.createdAt) / (1000 * 60)
  );
  
  return this.save();
};

supportTicketSchema.methods.close = function() {
  this.status = 'closed';
  this.closedAt = new Date();
  return this.save();
};

// Static methods
supportTicketSchema.statics.getOverdueTickets = function() {
  const now = new Date();
  return this.find({
    status: { $in: ['open', 'in_progress'] },
    $or: [
      { 'sla.responseDeadline': { $lt: now }, 'sla.responseStatus': 'overdue' },
      { 'sla.resolutionDeadline': { $lt: now }, 'sla.resolutionStatus': 'overdue' }
    ],
    isActive: true
  });
};

supportTicketSchema.statics.getEmergencyTickets = function() {
  return this.find({
    'emergencyAlert.isEmergency': true,
    status: { $in: ['open', 'in_progress'] },
    isActive: true
  }).sort({ createdAt: -1 });
};

// Add indexes
supportTicketSchema.index({ ticketNumber: 1 });
supportTicketSchema.index({ customer: 1 });
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ priority: 1 });
supportTicketSchema.index({ category: 1 });
supportTicketSchema.index({ assignedTo: 1 });
supportTicketSchema.index({ createdAt: -1 });
supportTicketSchema.index({ 'emergencyAlert.isEmergency': 1 });
supportTicketSchema.index({ 'specialRequest.isSpecial': 1 });
supportTicketSchema.index({ isActive: 1 });

supportTicketSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
