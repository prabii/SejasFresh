const express = require('express');
const router = express.Router();
const {
  getAvailableOrders,
  getDeliveryOrders,
  getDeliveredOrders,
  getDeliveryOrderById,
  acceptOrder,
  updateDeliveryOrderStatus
} = require('../controllers/deliveryController');
const { protect, authorize } = require('../middleware/auth');

// All delivery routes require authentication and delivery role
router.use(protect);
router.use(authorize('delivery'));

router.get('/orders/available', getAvailableOrders);
router.get('/orders/delivered', getDeliveredOrders);
router.get('/orders', getDeliveryOrders);
router.post('/orders/:id/accept', acceptOrder);
router.get('/orders/:id', getDeliveryOrderById);
router.patch('/orders/:id/status', updateDeliveryOrderStatus);

module.exports = router;

