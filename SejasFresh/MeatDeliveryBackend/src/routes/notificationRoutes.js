const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
  clearAllNotifications,
  getPreferences,
  updatePreferences,
  sendWelcomeNotification
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// All notification routes require authentication
router.use(protect);

// Specific routes must come before parameterized routes
router.get('/unread-count', getUnreadCount);
router.get('/preferences', getPreferences);
router.patch('/read-all', markAllAsRead);
router.delete('/clear-all', clearAllNotifications); // Must come before /:id route
router.put('/preferences', updatePreferences);
router.post('/welcome', sendWelcomeNotification);
router.get('/', getNotifications);
// Parameterized routes come last
router.get('/:id', getNotificationById);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;

