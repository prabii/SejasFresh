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

// Debug middleware - log all requests
router.use((req, res, next) => {
  if (req.method === 'DELETE' && req.path.includes('clear')) {
    console.log('🔍 DELETE request to notifications:', {
      method: req.method,
      path: req.path,
      originalUrl: req.originalUrl,
      baseUrl: req.baseUrl,
      url: req.url
    });
  }
  next();
});

// IMPORTANT: Specific routes MUST come before parameterized routes
// Express matches routes in order, so exact matches must be first

// GET routes - specific first
router.get('/unread-count', getUnreadCount);
router.get('/preferences', getPreferences);
router.get('/', getNotifications);

// PATCH routes - specific first
router.patch('/read-all', markAllAsRead);

// PUT routes
router.put('/preferences', updatePreferences);

// POST routes
router.post('/welcome', sendWelcomeNotification);

// DELETE routes - CRITICAL: /clear-all MUST come before /:id
// Use exact match with no parameters
router.delete('/clear-all', (req, res, next) => {
  console.log('✅ Route /clear-all matched!');
  clearAllNotifications(req, res, next);
});

// Parameterized routes come LAST (after all specific routes)
router.get('/:id', getNotificationById);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;

