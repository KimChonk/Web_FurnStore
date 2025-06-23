const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  personalInfo: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    nationalId: String,
    occupation: String
  },
  contactInfo: {
    primaryPhone: String,
    secondaryPhone: String,
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },
  addresses: [{
    type: {
      type: String,
      enum: ['home', 'work', 'shipping', 'billing'],
      default: 'home'
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    street: String,
    city: String,
    district: String,
    ward: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  preferences: {
    language: {
      type: String,
      enum: ['vi', 'en'],
      default: 'vi'
    },
    currency: {
      type: String,
      enum: ['VND', 'USD'],
      default: 'VND'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    newsletter: {
      type: Boolean,
      default: false
    }
  },
  statistics: {
    totalOrders: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    },
    lastOrderDate: Date,
    favoriteCategories: [String],
    loyaltyPoints: {
      type: Number,
      default: 0
    },
    membershipLevel: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze'
    }
  },
  socialLinks: {
    facebook: String,
    instagram: String,
    twitter: String
  },
  bankInfo: {
    bankName: String,
    accountNumber: String,
    accountHolderName: String,
    branchName: String
  },
  employmentInfo: {
    department: String,
    position: String,
    employeeId: String,
    startDate: Date,
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    workSchedule: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'freelance']
    },
    salary: {
      amount: Number,
      currency: {
        type: String,
        default: 'VND'
      }
    }
  }
}, {
  timestamps: true
});

// Indexes
userProfileSchema.index({ userId: 1 });
userProfileSchema.index({ 'personalInfo.nationalId': 1 });
userProfileSchema.index({ 'statistics.membershipLevel': 1 });

module.exports = mongoose.model('UserProfile', userProfileSchema);
