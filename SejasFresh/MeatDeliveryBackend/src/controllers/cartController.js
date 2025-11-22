const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product')
      .populate('appliedCoupon');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
      await cart.populate('items.product');
    }

    const totals = cart.calculateTotals();

    // Format response
    const cartObj = cart.toObject();
    cartObj.totalItems = totals.totalItems;
    cartObj.subtotal = totals.subtotal;
    
    // Calculate discount if coupon is applied
    let discountAmount = 0;
    if (cart.appliedCoupon) {
      discountAmount = cart.appliedCoupon.calculateDiscount(totals.subtotal);
      // Format appliedCoupon for frontend
      cartObj.appliedCoupon = {
        code: cart.appliedCoupon.code,
        discount: discountAmount,
        appliedAt: cart.updatedAt || new Date().toISOString()
      };
    } else {
      cartObj.appliedCoupon = null;
    }
    
    cartObj.discountAmount = discountAmount;
    cartObj.finalAmount = totals.subtotal - discountAmount;
    cartObj.totalAmount = cartObj.finalAmount;
    cartObj.formattedTotal = `₹${cartObj.finalAmount.toLocaleString('en-IN')}`;

    res.json({
      success: true,
      data: cartObj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide productId and quantity'
      });
    }

    // Validate productId is a valid MongoDB ObjectId
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        priceAtTime: product.discountedPrice || product.price
      });
    }

    await cart.save();
    await cart.populate('items.product');
    await cart.populate('appliedCoupon');

    const totals = cart.calculateTotals();
    const cartObj = cart.toObject();
    cartObj.totalItems = totals.totalItems;
    cartObj.subtotal = totals.subtotal;
    
    // Calculate discount if coupon is applied
    let discountAmount = 0;
    if (cart.appliedCoupon) {
      discountAmount = cart.appliedCoupon.calculateDiscount(totals.subtotal);
      cartObj.appliedCoupon = {
        code: cart.appliedCoupon.code,
        discount: discountAmount,
        appliedAt: cart.updatedAt || new Date().toISOString()
      };
    } else {
      cartObj.appliedCoupon = null;
    }
    
    cartObj.discountAmount = discountAmount;
    cartObj.finalAmount = totals.subtotal - discountAmount;
    cartObj.totalAmount = cartObj.finalAmount;
    cartObj.formattedTotal = `₹${cartObj.finalAmount.toLocaleString('en-IN')}`;

    res.json({
      success: true,
      data: cartObj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update/:itemId
// @access  Private
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid quantity'
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product');
    await cart.populate('appliedCoupon');

    const totals = cart.calculateTotals();
    const cartObj = cart.toObject();
    cartObj.totalItems = totals.totalItems;
    cartObj.subtotal = totals.subtotal;
    
    // Calculate discount if coupon is applied
    let discountAmount = 0;
    if (cart.appliedCoupon) {
      discountAmount = cart.appliedCoupon.calculateDiscount(totals.subtotal);
      cartObj.appliedCoupon = {
        code: cart.appliedCoupon.code,
        discount: discountAmount,
        appliedAt: cart.updatedAt || new Date().toISOString()
      };
    } else {
      cartObj.appliedCoupon = null;
    }
    
    cartObj.discountAmount = discountAmount;
    cartObj.finalAmount = totals.subtotal - discountAmount;
    cartObj.totalAmount = cartObj.finalAmount;
    cartObj.formattedTotal = `₹${cartObj.finalAmount.toLocaleString('en-IN')}`;

    res.json({
      success: true,
      data: cartObj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:itemId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();
    await cart.populate('items.product');
    await cart.populate('appliedCoupon');

    const totals = cart.calculateTotals();
    const cartObj = cart.toObject();
    cartObj.totalItems = totals.totalItems;
    cartObj.subtotal = totals.subtotal;
    
    // Calculate discount if coupon is applied
    let discountAmount = 0;
    if (cart.appliedCoupon) {
      discountAmount = cart.appliedCoupon.calculateDiscount(totals.subtotal);
      cartObj.appliedCoupon = {
        code: cart.appliedCoupon.code,
        discount: discountAmount,
        appliedAt: cart.updatedAt || new Date().toISOString()
      };
    } else {
      cartObj.appliedCoupon = null;
    }
    
    cartObj.discountAmount = discountAmount;
    cartObj.finalAmount = totals.subtotal - discountAmount;
    cartObj.totalAmount = cartObj.finalAmount;
    cartObj.formattedTotal = `₹${cartObj.finalAmount.toLocaleString('en-IN')}`;

    res.json({
      success: true,
      data: cartObj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    cart.appliedCoupon = null;
    await cart.save();
    await cart.populate('items.product');
    await cart.populate('appliedCoupon');

    const totals = cart.calculateTotals();
    const cartObj = cart.toObject();
    cartObj.totalItems = totals.totalItems;
    cartObj.subtotal = totals.subtotal;
    cartObj.appliedCoupon = null;
    cartObj.discountAmount = 0;
    cartObj.finalAmount = totals.subtotal;
    cartObj.totalAmount = totals.subtotal;
    cartObj.formattedTotal = `₹${totals.subtotal.toLocaleString('en-IN')}`;

    res.json({
      success: true,
      data: cartObj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get cart summary
// @route   GET /api/cart/summary
// @access  Private
exports.getCartSummary = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.json({
        success: true,
        data: {
          itemCount: 0,
          totalAmount: 0,
          formattedTotal: '₹0',
          items: []
        }
      });
    }

    const totals = cart.calculateTotals();
    const items = cart.items.map(item => ({
      productId: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      priceAtTime: item.priceAtTime,
      subtotal: item.priceAtTime * item.quantity
    }));

    res.json({
      success: true,
      data: {
        itemCount: totals.totalItems,
        totalAmount: totals.finalAmount,
        formattedTotal: `₹${totals.finalAmount.toLocaleString('en-IN')}`,
        items
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply coupon to cart
// @route   POST /api/cart/apply-coupon
// @access  Private
exports.applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide coupon code'
      });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    const totals = cart.calculateTotals();
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired coupon'
      });
    }

    if (!coupon.isValid(totals.subtotal, req.user._id)) {
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

    cart.appliedCoupon = coupon._id;
    await cart.save();
    await cart.populate('appliedCoupon');

    const newTotals = cart.calculateTotals();
    const discount = coupon.calculateDiscount(totals.subtotal);
    newTotals.discountAmount = discount;
    newTotals.finalAmount = totals.subtotal - discount;

    const cartObj = cart.toObject();
    cartObj.totalItems = newTotals.totalItems;
    cartObj.subtotal = newTotals.subtotal;
    
    // Format appliedCoupon for frontend
    cartObj.appliedCoupon = {
      code: coupon.code,
      discount: discount,
      appliedAt: cart.updatedAt || new Date().toISOString()
    };
    
    cartObj.discountAmount = newTotals.discountAmount;
    cartObj.finalAmount = newTotals.finalAmount;
    cartObj.totalAmount = newTotals.finalAmount;
    cartObj.formattedTotal = `₹${newTotals.finalAmount.toLocaleString('en-IN')}`;

    res.json({
      success: true,
      data: cartObj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove coupon from cart
// @route   DELETE /api/cart/remove-coupon
// @access  Private
exports.removeCoupon = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.appliedCoupon = null;
    await cart.save();
    await cart.populate('items.product');

    const totals = cart.calculateTotals();
    const cartObj = cart.toObject();
    cartObj.totalItems = totals.totalItems;
    cartObj.subtotal = totals.subtotal;
    cartObj.appliedCoupon = null;
    cartObj.discountAmount = 0;
    cartObj.finalAmount = totals.subtotal;
    cartObj.totalAmount = totals.subtotal;
    cartObj.formattedTotal = `₹${totals.subtotal.toLocaleString('en-IN')}`;

    res.json({
      success: true,
      data: cartObj
    });
  } catch (error) {
    next(error);
  }
};

