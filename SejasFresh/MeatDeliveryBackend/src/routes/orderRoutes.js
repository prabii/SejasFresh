const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  assignDelivery,
  getOrderStats
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// User routes
router.use(protect);
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.patch('/:id/cancel', cancelOrder);

// Admin routes
router.patch('/:id/status', authorize('admin'), updateOrderStatus);
router.patch('/:id/assign', authorize('admin'), assignDelivery);
router.get('/stats', authorize('admin'), getOrderStats);

module.exports = router;

