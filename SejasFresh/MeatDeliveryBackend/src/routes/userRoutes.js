const express = require('express');
const router = express.Router();
const { updatePushToken } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// All user routes require authentication
router.use(protect);

router.post('/push-token', updatePushToken);

module.exports = router;

