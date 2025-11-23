const User = require('../models/User');

// @desc    Update push token (for mobile/Expo)
// @route   POST /api/users/push-token
// @access  Private
exports.updatePushToken = async (req, res, next) => {
  try {
    const { pushToken, platform } = req.body;

    req.user.pushToken = pushToken;
    await req.user.save();

    res.json({
      success: true,
      message: 'Push token updated'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update push subscription (for web push)
// @route   POST /api/users/push-subscription
// @access  Private
exports.updatePushSubscription = async (req, res, next) => {
  try {
    const { subscription, platform } = req.body;

    if (!subscription) {
      return res.status(400).json({
        success: false,
        message: 'Push subscription is required'
      });
    }

    // Validate subscription has required fields
    if (!subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
      return res.status(400).json({
        success: false,
        message: 'Invalid push subscription format'
      });
    }

    // Store web push subscription (replace old one if exists)
    req.user.pushSubscription = subscription;
    // Also clear old fake web tokens if they exist
    if (req.user.pushToken && req.user.pushToken.startsWith('web_')) {
      console.log(`Clearing old fake web token for user ${req.user._id}`);
      req.user.pushToken = null;
    }
    await req.user.save();

    console.log(`✅ Web push subscription saved for user ${req.user._id} (endpoint: ${subscription.endpoint.substring(0, 50)}...)`);

    res.json({
      success: true,
      message: 'Push subscription updated'
    });
  } catch (error) {
    next(error);
    console.error('Error updating push subscription:', error);
  }
};

