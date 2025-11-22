const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { generateOrderNumber } = require('../utils/helpers');

// @desc    Create order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const {
      items,
      savedAddressId,
      deliveryAddress,
      contactInfo,
      paymentMethod,
      specialInstructions
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide order items'
      });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) continue;

      const price = product.discountedPrice || product.price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtTime: price,
        name: product.name,
        image: product.image
      });
    }

    // Get cart to check for applied coupon
    const userCart = await Cart.findOne({ user: req.user._id }).populate('appliedCoupon');
    
    // Calculate discount from coupon if applied
    let discountAmount = 0;
    if (userCart && userCart.appliedCoupon) {
      discountAmount = userCart.appliedCoupon.calculateDiscount(subtotal);
    }
    
    // Free delivery - no delivery fee
    const deliveryFee = 0;
    // No tax
    const tax = 0;
    const total = Math.max(0, subtotal - discountAmount + deliveryFee + tax);

    // Handle saved address if provided
    let finalDeliveryAddress = deliveryAddress;
    if (savedAddressId && !deliveryAddress) {
      const Address = require('../models/Address');
      
      // Validate if savedAddressId is a valid MongoDB ObjectId
      if (!savedAddressId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid address ID format. Please select a valid address.'
        });
      }
      
      const savedAddress = await Address.findOne({ 
        _id: savedAddressId, 
        user: req.user._id 
      });
      
      if (!savedAddress) {
        return res.status(404).json({
          success: false,
          message: 'Address not found. Please select a valid delivery address.'
        });
      }
      
      finalDeliveryAddress = {
        street: savedAddress.street,
        city: savedAddress.city,
        state: savedAddress.state,
        zipCode: savedAddress.zipCode,
        country: savedAddress.country || 'India',
        landmark: savedAddress.landmark
      };
    }
    
    // Ensure delivery address is provided
    if (!finalDeliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a delivery address'
      });
    }

    // Create order
    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      customer: req.user._id,
      items: orderItems,
      deliveryAddress: finalDeliveryAddress,
      contactInfo: contactInfo || {
        phone: req.user.phone,
        email: req.user.email
      },
      pricing: {
        subtotal,
        discount: discountAmount,
        deliveryFee,
        tax,
        total
      },
      appliedCoupon: userCart && userCart.appliedCoupon ? userCart.appliedCoupon._id : null,
      paymentInfo: {
        method: paymentMethod || 'cash-on-delivery'
      },
      specialInstructions,
      statusHistory: [{
        status: 'pending',
        timestamp: new Date(),
        notes: 'Order created'
      }]
    });

    // Mark coupon as used if applied
    if (userCart && userCart.appliedCoupon) {
      // Get coupon ID - handle both populated and unpopulated cases
      const couponId = userCart.appliedCoupon._id || userCart.appliedCoupon;
      if (couponId) {
        const coupon = await Coupon.findById(couponId);
        if (coupon) {
          // Add user to usedBy array if not already present
          if (!coupon.usedBy || !coupon.usedBy.some(id => id.toString() === req.user._id.toString())) {
            coupon.usedBy = coupon.usedBy || [];
            coupon.usedBy.push(req.user._id);
            coupon.usedCount = (coupon.usedCount || 0) + 1;
            await coupon.save();
          }
        }
      }
    }

    // Clear cart
    if (userCart) {
      userCart.items = [];
      userCart.appliedCoupon = null;
      await userCart.save();
    }

    // Create notification for order placement
    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        user: req.user._id,
        title: 'Order Placed Successfully! 🎉',
        message: `Your order #${order.orderNumber} has been placed. We'll notify you when it's confirmed.`,
        type: 'order',
        category: 'order',
        priority: 'high',
        metadata: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          screen: 'order-details'
        }
      });
    } catch (notificationError) {
      // Log error but don't fail the order creation
      console.error('Error creating order notification:', notificationError);
    }

    await order.populate('customer', 'firstName lastName email phone');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        ...order.toObject(),
        formattedTotal: `₹${total.toLocaleString('en-IN')}`
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.product')
      .populate('assignedTo', 'firstName lastName phone email');

    const total = await Order.countDocuments({ customer: req.user._id });

    const formattedOrders = orders.map(order => ({
      ...order.toObject(),
      formattedTotal: `₹${order.pricing.total.toLocaleString('en-IN')}`
    }));

    res.json({
      success: true,
      data: {
        data: formattedOrders,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone')
      .populate('items.product')
      .populate('assignedTo', 'firstName lastName phone email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order or is admin
    if (order.customer._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    res.json({
      success: true,
      data: {
        ...order.toObject(),
        formattedTotal: `₹${order.pricing.total.toLocaleString('en-IN')}`
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PATCH /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`
      });
    }

    order.status = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      notes: reason || 'Cancelled by customer'
    });

    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin)
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      notes: notes || `Status updated to ${status}`
    });

    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign delivery (Admin)
// @route   PATCH /api/orders/:id/assign
// @access  Private/Admin
exports.assignDelivery = async (req, res, next) => {
  try {
    const { assignedTo, estimatedTime, notes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.assignedTo = assignedTo;
    order.statusHistory.push({
      status: 'out-for-delivery',
      timestamp: new Date(),
      notes: notes || `Assigned to delivery person. ETA: ${estimatedTime}`
    });

    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order statistics (Admin)
// @route   GET /api/orders/stats
// @access  Private/Admin
exports.getOrderStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);

    const statusBreakdown = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.total' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        statusBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

