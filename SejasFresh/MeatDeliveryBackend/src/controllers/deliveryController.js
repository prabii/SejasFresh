const Order = require('../models/Order');
const Notification = require('../models/Notification');

// @desc    Get available orders (not yet assigned, ready for delivery)
// @route   GET /api/delivery/orders/available
// @access  Private/Delivery
exports.getAvailableOrders = async (req, res, next) => {
  try {
    // Get orders that are preparing or confirmed and not yet assigned
    const orders = await Order.find({
      status: { $in: ['preparing', 'confirmed'] },
      assignedTo: null
    })
      .populate('customer', 'firstName lastName email phone')
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders assigned to delivery boy
// @route   GET /api/delivery/orders
// @access  Private/Delivery
exports.getDeliveryOrders = async (req, res, next) => {
  try {
    // Get active orders (preparing, out-for-delivery)
    const activeOrders = await Order.find({
      assignedTo: req.user._id,
      status: { $in: ['preparing', 'out-for-delivery'] }
    })
      .populate('customer', 'firstName lastName email phone')
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 });

    // Get delivered orders count for stats
    const deliveredCount = await Order.countDocuments({
      assignedTo: req.user._id,
      status: 'delivered'
    });

    res.json({
      success: true,
      data: activeOrders,
      stats: {
        delivered: deliveredCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get delivered orders history
// @route   GET /api/delivery/orders/delivered
// @access  Private/Delivery
exports.getDeliveredOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      assignedTo: req.user._id,
      status: 'delivered'
    })
      .populate('customer', 'firstName lastName email phone')
      .populate('items.product', 'name image')
      .sort({ updatedAt: -1 })
      .limit(50); // Limit to last 50 delivered orders

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order assigned to delivery boy
// @route   GET /api/delivery/orders/:id
// @access  Private/Delivery
exports.getDeliveryOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      assignedTo: req.user._id
    })
      .populate('customer', 'firstName lastName email phone')
      .populate('items.product', 'name image price discountedPrice');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not assigned to you'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept order (Delivery boy accepts an available order)
// @route   POST /api/delivery/orders/:id/accept
// @access  Private/Delivery
exports.acceptOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', '_id firstName lastName email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Log order details for debugging
    console.log('Accept order request:', {
      orderId: order._id,
      currentStatus: order.status,
      assignedTo: order.assignedTo,
      requestedBy: req.user._id
    });

    // Normalize status to lowercase for comparison
    const normalizedStatus = (order.status || '').toLowerCase().trim();
    
    // Check if order is available (preparing or confirmed, not assigned)
    if (normalizedStatus !== 'preparing' && normalizedStatus !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: `Order is not available for delivery. Current status: "${order.status}". Status must be 'preparing' or 'confirmed'.`,
        currentStatus: order.status
      });
    }

    // Check if order is already assigned
    // Handle both ObjectId and null/undefined cases
    const assignedToId = order.assignedTo ? (order.assignedTo._id || order.assignedTo).toString() : null;
    const userId = req.user._id.toString();

    if (assignedToId && assignedToId !== userId) {
      return res.status(400).json({
        success: false,
        message: 'Order is already assigned to another delivery agent',
        assignedTo: assignedToId
      });
    }

    // If already assigned to this user, just return success (idempotent)
    if (assignedToId === userId) {
      await order.populate('assignedTo', 'firstName lastName phone');
      return res.json({
        success: true,
        data: order,
        message: 'Order is already assigned to you'
      });
    }

    // Assign order to delivery boy and update status
    order.assignedTo = req.user._id;
    order.status = 'out-for-delivery';
    order.statusHistory.push({
      status: 'out-for-delivery',
      timestamp: new Date(),
      notes: `Accepted by delivery agent: ${req.user.firstName} ${req.user.lastName}`
    });

    await order.save();

    // Populate delivery agent info for notification
    await order.populate('assignedTo', 'firstName lastName phone');

    // Create notification for customer
    if (order.customer && order.customer._id) {
      const deliveryAgent = order.assignedTo;
      await Notification.create({
        user: order.customer._id,
        recipient: order.customer._id, // Support both fields for compatibility
        title: 'Order Out for Delivery! 🚚',
        message: `Your order #${order.orderNumber} is on the way! Delivery agent: ${deliveryAgent.firstName} ${deliveryAgent.lastName} (${deliveryAgent.phone})`,
        type: 'order',
        category: 'order',
        priority: 'high',
        metadata: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          screen: 'order-details',
          status: 'out-for-delivery',
          deliveryAgent: {
            name: `${deliveryAgent.firstName} ${deliveryAgent.lastName}`,
            phone: deliveryAgent.phone
          }
        }
      });
    }

    res.json({
      success: true,
      data: order,
      message: 'Order accepted successfully. Status updated to out-for-delivery.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Delivery boy can mark as delivered)
// @route   PATCH /api/delivery/orders/:id/status
// @access  Private/Delivery
exports.updateDeliveryOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findOne({
      _id: req.params.id,
      assignedTo: req.user._id
    }).populate('customer', '_id firstName lastName');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not assigned to you'
      });
    }

    // Delivery boy can only mark as delivered
    if (status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'You can only mark orders as delivered'
      });
    }

    // Only allow if order is out-for-delivery
    if (order.status !== 'out-for-delivery') {
      return res.status(400).json({
        success: false,
        message: 'Order must be out for delivery before marking as delivered'
      });
    }

    order.status = 'delivered';
    order.statusHistory.push({
      status: 'delivered',
      timestamp: new Date(),
      notes: 'Order delivered by delivery agent'
    });

    await order.save();

    // Create notification for customer
    if (order.customer && order.customer._id) {
      await Notification.create({
        user: order.customer._id,
        recipient: order.customer._id, // Support both fields for compatibility
        title: 'Order Delivered! ✅',
        message: `Your order #${order.orderNumber} has been delivered successfully. Thank you for your order!`,
        type: 'order',
        category: 'order',
        priority: 'high',
        metadata: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          screen: 'order-details',
          status: 'delivered'
        }
      });
    }

    res.json({
      success: true,
      data: order,
      message: 'Order marked as delivered successfully'
    });
  } catch (error) {
    next(error);
  }
};

