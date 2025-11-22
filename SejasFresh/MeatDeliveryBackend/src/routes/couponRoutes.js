const express = require('express');
const router = express.Router();
const {
  getActiveCoupons,
  validateCoupon,
  applyCoupon
} = require('../controllers/couponController');
const { protect } = require('../middleware/auth');

// Public route
router.get('/active', getActiveCoupons);

// Protected routes
router.use(protect);
router.post('/validate', validateCoupon);
router.post('/apply', applyCoupon);

module.exports = router;

