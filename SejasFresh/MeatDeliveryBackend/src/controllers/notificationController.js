const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// @desc    Get notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { category, isRead, type } = req.query;

    const query = { user: req.user._id, isActive: true };
    if (category) query.category = category;
    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (type) query.type = type;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);

    res.json({
      success: true,
      data: {
        data: notifications,
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

// @desc    Get notification by ID
// @route   GET /api/notifications/:id
// @access  Private
exports.getNotificationById = async (req, res, next) => {
  try {
    // Validate that id is a valid ObjectId (not a string like "clear-all")
    const id = req.params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID'
      });
    }

    const notification = await Notification.findById(id);

    if (!notification || notification.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    // Validate that id is a valid ObjectId (not a string like "clear-all")
    const id = req.params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID'
      });
    }

    const notification = await Notification.findById(id);

    if (!notification || notification.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all as read
// @route   PATCH /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
      isActive: true
    });

    res.json({
      success: true,
      data: {
        unreadCount: count
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res, next) => {
  try {
    // Validate that id is a valid ObjectId (not a string like "clear-all")
    const id = req.params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID'
      });
    }

    const notification = await Notification.findById(id);

    if (!notification || notification.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.deleteOne();

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all notifications
// @route   DELETE /api/notifications/clear-all
// @access  Private
exports.clearAllNotifications = async (req, res, next) => {
  try {
    console.log('🗑️ Clear all notifications called for user:', req.user._id);
    const result = await Notification.deleteMany({ user: req.user._id });
    console.log('✅ Cleared', result.deletedCount, 'notifications');

    res.json({
      success: true,
      message: 'All notifications cleared',
      data: {
        modifiedCount: result.deletedCount
      }
    });
  } catch (error) {
    console.error('❌ Error clearing all notifications:', error);
    next(error);
  }
};

// @desc    Get notification preferences
// @route   GET /api/notifications/preferences
// @access  Private
exports.getPreferences = async (req, res, next) => {
  try {
    // In a real app, this would be stored in user preferences
    res.json({
      success: true,
      data: {
        push: true,
        email: true,
        sms: false,
        inApp: true
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update notification preferences
// @route   PUT /api/notifications/preferences
// @access  Private
exports.updatePreferences = async (req, res, next) => {
  try {
    // In a real app, this would update user preferences
    res.json({
      success: true,
      data: req.body
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send welcome notification
// @route   POST /api/notifications/welcome
// @access  Private
exports.sendWelcomeNotification = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const notification = await Notification.create({
      user: userId || req.user._id,
      title: 'Welcome!',
      message: 'Thank you for joining Sejas Fresh Meat Delivery!',
      type: 'system',
      category: 'system',
      priority: 'high'
    });

    res.json({
      success: true,
      message: 'Welcome notification sent',
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

