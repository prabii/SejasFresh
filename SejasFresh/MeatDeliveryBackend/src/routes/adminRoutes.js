const express = require('express');
const router = express.Router();
const {
  // Products
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProductsAdmin,
  // Orders
  getAllOrders,
  updateOrderStatusAdmin,
  assignDeliveryAdmin,
  // Users
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  createUser,
  // Coupons
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  // Dashboard
  getDashboardStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Product Management
router.post('/products', uploadSingle, createProduct);
router.put('/products/:id', uploadSingle, updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/products', getAllProductsAdmin);

// Order Management
router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatusAdmin);
router.patch('/orders/:id/assign', assignDeliveryAdmin);

// User Management
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.get('/users/:id', getUserDetails);
router.patch('/users/:id/status', updateUserStatus);

// Coupon Management
router.get('/coupons', getAllCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

// Dashboard Stats
router.get('/dashboard/stats', getDashboardStats);

module.exports = router;

