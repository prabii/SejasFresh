const Coupon = require('../models/Coupon');

// @desc    Get active coupons
// @route   GET /api/coupons/active
// @access  Public
exports.getActiveCoupons = async (req, res, next) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validTo: { $gte: now }
    }).sort({ createdAt: -1 });

    const formatted = coupons.map(coupon => ({
      ...coupon.toObject(),
      formattedDiscount: coupon.type === 'percentage' 
        ? `${coupon.value}% off` 
        : `₹${coupon.value} off`
    }));

    res.json({
      success: true,
      data: { data: formatted }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate coupon
// @route   POST /api/coupons/validate
// @access  Private
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired coupon'
      });
    }

    if (!coupon.isValid(orderAmount, req.user._id)) {
      // Check if it's because user already used it and limit is reached
      const hasUsed = coupon.usedBy && coupon.usedBy.some(id => id.toString() === req.user._id.toString());
      if (hasUsed && coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({
          success: false,
          message: 'You have already used this coupon and the usage limit has been reached'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired coupon'
      });
    }

    const discount = coupon.calculateDiscount(orderAmount);

    res.json({
      success: true,
      data: {
        coupon,
        discount,
        applicableAmount: orderAmount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply coupon
// @route   POST /api/coupons/apply
// @access  Private
exports.applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.json({
      success: true,
      data: coupon
    });
  } catch (error) {
    next(error);
  }
};

