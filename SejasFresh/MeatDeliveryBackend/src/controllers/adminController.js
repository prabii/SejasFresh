const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const path = require('path');

// Product Management
exports.createProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body };
    
    // Handle file upload
    if (req.file) {
      productData.image = req.file.filename;
    }
    
    // Parse JSON fields if they come as strings from FormData
    if (typeof productData.availability === 'string') {
      productData.availability = JSON.parse(productData.availability);
    }
    if (typeof productData.weight === 'string') {
      productData.weight = JSON.parse(productData.weight);
    }
    
    // Convert numeric fields
    if (productData.price) productData.price = Number(productData.price);
    if (productData.discountedPrice) productData.discountedPrice = Number(productData.discountedPrice);
    if (productData.isActive !== undefined) {
      productData.isActive = productData.isActive === 'true' || productData.isActive === true;
    }
    
    const product = await Product.create(productData);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body };
    
    // Handle file upload
    if (req.file) {
      productData.image = req.file.filename;
    }
    
    // Parse JSON fields if they come as strings from FormData
    if (typeof productData.availability === 'string') {
      productData.availability = JSON.parse(productData.availability);
    }
    if (typeof productData.weight === 'string') {
      productData.weight = JSON.parse(productData.weight);
    }
    
    // Convert numeric fields
    if (productData.price) productData.price = Number(productData.price);
    if (productData.discountedPrice) productData.discountedPrice = Number(productData.discountedPrice);
    if (productData.isActive !== undefined) {
      productData.isActive = productData.isActive === 'true' || productData.isActive === true;
    }
    
    const product = await Product.findByIdAndUpdate(req.params.id, productData, {
      new: true,
      runValidators: true
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

exports.getAllProductsAdmin = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    
    // Format image URLs
    const formattedProducts = products.map(product => {
      const productObj = product.toObject();
      if (productObj.image) {
        productObj.image = `${req.protocol}://${req.get('host')}/uploads/${productObj.image}`;
      }
      if (productObj.images && productObj.images.length > 0) {
        productObj.images = productObj.images.map(img => ({
          ...img,
          url: img.url.startsWith('http') ? img.url : `${req.protocol}://${req.get('host')}/uploads/${img.url}`
        }));
      }
      return productObj;
    });
    
    res.json({ success: true, data: formattedProducts });
  } catch (error) {
    next(error);
  }
};

// Order Management
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'firstName lastName email phone')
      .populate('assignedTo', 'firstName lastName phone email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatusAdmin = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const order = await Order.findById(req.params.id).populate('customer', '_id firstName lastName');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    const oldStatus = order.status;
    order.status = status;
    order.statusHistory.push({ status, timestamp: new Date(), notes });
    await order.save();
    
    // Create notification for status change
    if (oldStatus !== status && order.customer) {
      try {
        const Notification = require('../models/Notification');
        
        // Get status-specific message
        let title = '';
        let message = '';
        let priority = 'medium';
        
        switch (status) {
          case 'confirmed':
            title = 'Order Confirmed! ✅';
            message = `Your order #${order.orderNumber} has been confirmed and is being prepared.`;
            priority = 'high';
            break;
          case 'preparing':
            title = 'Order Being Prepared 👨‍🍳';
            message = `Your order #${order.orderNumber} is being prepared. It will be ready soon!`;
            priority = 'high';
            break;
          case 'out-for-delivery':
            title = 'Order Out for Delivery! 🚚';
            message = `Your order #${order.orderNumber} is on the way to you. Track it in your orders.`;
            priority = 'high';
            break;
          case 'delivered':
            title = 'Order Delivered! 🎉';
            message = `Your order #${order.orderNumber} has been delivered. Thank you for your order!`;
            priority = 'high';
            break;
          case 'cancelled':
            title = 'Order Cancelled';
            message = `Your order #${order.orderNumber} has been cancelled.${notes ? ` Reason: ${notes}` : ''}`;
            priority = 'high';
            break;
          default:
            title = 'Order Status Updated';
            message = `Your order #${order.orderNumber} status has been updated to ${status}.`;
        }
        
        await Notification.create({
          user: order.customer._id,
          recipient: order.customer._id, // Support both fields for compatibility
          title,
          message,
          type: 'order',
          category: 'order',
          priority,
          metadata: {
            orderId: order._id.toString(),
            orderNumber: order.orderNumber,
            screen: 'order-details',
            status: status
          }
        });
      } catch (notificationError) {
        // Log error but don't fail the status update
        console.error('Error creating status change notification:', notificationError);
      }
    }
    
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

exports.assignDeliveryAdmin = async (req, res, next) => {
  try {
    const { assignedTo, estimatedTime, notes } = req.body;
    const order = await Order.findById(req.params.id)
      .populate('customer', '_id firstName lastName email phone')
      .populate('assignedTo', 'firstName lastName phone');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Get delivery agent info
    const deliveryAgent = await User.findById(assignedTo).select('firstName lastName phone');
    if (!deliveryAgent) {
      return res.status(404).json({ success: false, message: 'Delivery agent not found' });
    }
    
    order.assignedTo = assignedTo;
    order.status = 'out-for-delivery';
    order.statusHistory.push({
      status: 'out-for-delivery',
      timestamp: new Date(),
      notes: notes || `Assigned to ${deliveryAgent.firstName} ${deliveryAgent.lastName}. ETA: ${estimatedTime || '30 minutes'}`
    });
    await order.save();
    
    // Populate assignedTo for response
    await order.populate('assignedTo', 'firstName lastName phone email');
    
    // Create notification for delivery assignment
    if (order.customer) {
      try {
        const Notification = require('../models/Notification');
        const etaText = estimatedTime ? ` Estimated delivery time: ${estimatedTime}.` : '';
        
        await Notification.create({
          user: order.customer._id,
          recipient: order.customer._id, // Support both fields for compatibility
          title: 'Order Out for Delivery! 🚚',
          message: `Your order #${order.orderNumber} is on the way! Delivery agent: ${deliveryAgent.firstName} ${deliveryAgent.lastName} (${deliveryAgent.phone}).${etaText}`,
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
      } catch (notificationError) {
        // Log error but don't fail the assignment
        console.error('Error creating delivery assignment notification:', notificationError);
      }
    }
    
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// User Management
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password -pin').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password, role } = req.body;

    // Validate required fields
    if (!firstName || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide first name and phone number'
      });
    }

    // For admin and delivery roles, email and password are required
    if ((role === 'admin' || role === 'delivery') && (!email || !password)) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required for admin and delivery roles'
      });
    }

    // Check if user exists by phone
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this phone number'
      });
    }

    // If email provided, check if it exists
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName: lastName || '',
      email: email || undefined,
      password: password || undefined,
      phone,
      role: role || 'customer',
      phoneVerified: true,
      emailVerified: (role === 'admin' || role === 'delivery') ? true : false,
      isActive: true
    });

    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.pin;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userObj
    });
  } catch (error) {
    next(error);
  }
};

// Dashboard Stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalOrders, totalProducts, totalUsers] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ role: { $ne: 'admin' } }),
    ]);

    const revenueResult = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        totalProducts,
        totalUsers,
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -pin');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password -pin');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// Coupon Management
exports.getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
};

exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
};

exports.updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    res.json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
};

exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    next(error);
  }
};

