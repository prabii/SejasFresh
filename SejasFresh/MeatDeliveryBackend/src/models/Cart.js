const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
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
  priceAtTime: {
    type: Number,
    required: true
  }
}, { _id: true });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  appliedCoupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    default: null
  }
}, {
  timestamps: true
});

// Calculate totals
cartSchema.methods.calculateTotals = function() {
  let subtotal = 0;
  let totalItems = 0;

  this.items.forEach(item => {
    subtotal += item.priceAtTime * item.quantity;
    totalItems += item.quantity;
  });

  // Calculate discount if coupon applied
  let discountAmount = 0;
  if (this.appliedCoupon) {
    // This will be calculated in the controller
  }

  const finalAmount = subtotal - discountAmount;

  return {
    totalItems,
    subtotal,
    discountAmount,
    finalAmount
  };
};

module.exports = mongoose.model('Cart', cartSchema);

