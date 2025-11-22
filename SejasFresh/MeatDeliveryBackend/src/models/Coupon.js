const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please provide coupon code'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide coupon description']
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  minimumOrderValue: {
    type: Number,
    default: 0,
    min: 0
  },
  maximumDiscount: {
    type: Number,
    default: null
  },
  validFrom: {
    type: Date,
    required: true
  },
  validTo: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number,
    default: null // null means unlimited
  },
  usedCount: {
    type: Number,
    default: 0
  },
  usedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Check if coupon is valid
couponSchema.methods.isValid = function(orderAmount = 0, userId = null) {
  const now = new Date();
  
  if (!this.isActive) return false;
  if (now < this.validFrom || now > this.validTo) return false;
  if (orderAmount < this.minimumOrderValue) return false;
  if (this.usageLimit && this.usedCount >= this.usageLimit) return false;
  
  // Check if user has already used this coupon
  // Only block if usageLimit is set and user has used it AND overall limit is reached
  // If admin increases the limit, allow reuse if overall limit hasn't been reached
  if (userId && this.usedBy && this.usedBy.some(id => id.toString() === userId.toString())) {
    // If there's a usage limit and it's been reached, block reuse
    if (this.usageLimit && this.usedCount >= this.usageLimit) {
      return false;
    }
    // If no usage limit or limit hasn't been reached, allow reuse
    // This allows users to reuse coupons when admin increases the limit
  }
  
  return true;
};

// Calculate discount
couponSchema.methods.calculateDiscount = function(orderAmount) {
  if (!this.isValid(orderAmount)) return 0;
  
  let discount = 0;
  
  if (this.type === 'percentage') {
    discount = (orderAmount * this.value) / 100;
    if (this.maximumDiscount) {
      discount = Math.min(discount, this.maximumDiscount);
    }
  } else {
    discount = this.value;
  }
  
  return Math.round(discount);
};

module.exports = mongoose.model('Coupon', couponSchema);

