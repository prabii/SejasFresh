const express = require('express');
const router = express.Router();
const {
  register,
  login,
  loginWithPIN,
  requestOTP,
  verifyOTP,
  setPIN,
  forgotPIN,
  resetPIN,
  getMe,
  updateProfile,
  changePassword,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/login-pin', loginWithPIN);
router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);
router.post('/forgot-pin', forgotPIN);
router.post('/reset-pin', resetPIN);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.put('/me', updateProfile);
router.put('/change-password', changePassword);
router.post('/set-pin', setPIN);
router.post('/logout', logout);

module.exports = router;

