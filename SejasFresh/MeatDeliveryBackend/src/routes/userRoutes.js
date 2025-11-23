const express = require('express');
const router = express.Router();
const { updatePushToken, updatePushSubscription } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// All user routes require authentication
router.use(protect);

router.post('/push-token', updatePushToken);
router.post('/push-subscription', updatePushSubscription);

module.exports = router;

