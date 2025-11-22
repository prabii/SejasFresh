const User = require('../models/User');

// @desc    Update push token
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

