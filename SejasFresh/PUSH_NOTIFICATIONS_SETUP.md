# 🔔 Push Notifications Setup Guide

## Overview

Push notifications are now fully implemented for Admin and Delivery Boy apps. Notifications work on both **mobile browsers** and **web browsers**, and will show **system alerts** even when the app/browser is closed.

## ✅ What's Implemented

### Backend
1. **Admin Notifications on New Orders**
   - When any customer places an order, all admin users receive a push notification
   - Notification: "New Order Received! 📦"
   - Includes order number and total amount

2. **Admin Notifications on Delivery Acceptance**
   - When a delivery boy accepts an order, all admin users receive a push notification
   - Notification: "Order Accepted for Delivery! 🚚"
   - Includes order number and delivery agent name

3. **Push Notification Utility**
   - Supports sending to individual users
   - Supports sending to all users with a specific role
   - Works with Expo push tokens (mobile) and web push tokens

### Frontend - Admin App
1. **Web Push Notification Service**
   - Automatically registers for browser notifications on login
   - Shows system alerts even when browser is closed
   - Displays notification badge in header

2. **Notification Context**
   - Polls for new notifications every 30 seconds
   - Shows browser notifications for unread items
   - Manages notification state across the app

3. **Mobile Responsive Layout**
   - Responsive drawer navigation
   - Mobile-friendly header with hamburger menu
   - Touch-optimized interface

### Frontend - Delivery Boy App
1. **Web Push Notification Service**
   - Automatically registers for browser notifications on login
   - Shows system alerts even when browser is closed
   - Already has notification badge in header

2. **Enhanced Notification Context**
   - Integrated with web push notification service
   - Shows browser notifications for new orders
   - Mobile responsive (already implemented)

## 🚀 How It Works

### For Admin Users

1. **Login to Admin Dashboard**
   - Browser will ask for notification permission
   - Click "Allow" to enable push notifications
   - Push token is automatically registered with backend

2. **Receive Notifications**
   - When a customer places an order → Admin gets notification
   - When delivery boy accepts order → Admin gets notification
   - Notifications appear even when browser is closed (system alerts)

3. **View Notifications**
   - Click the notification bell icon in header
   - See unread count badge
   - Navigate to orders page from notification

### For Delivery Boy Users

1. **Login to Delivery Dashboard**
   - Browser will ask for notification permission
   - Click "Allow" to enable push notifications
   - Push token is automatically registered with backend

2. **Receive Notifications**
   - When new orders are available → Delivery boy gets notification
   - When order status changes → Delivery boy gets notification
   - Notifications appear even when browser is closed (system alerts)

## 📱 Mobile Responsiveness

### Admin App
- ✅ Responsive drawer navigation (hamburger menu on mobile)
- ✅ Mobile-optimized header
- ✅ Touch-friendly buttons and cards
- ✅ Responsive login page
- ✅ Adaptive padding and spacing

### Delivery Boy App
- ✅ Already mobile responsive
- ✅ Responsive drawer navigation
- ✅ Mobile-optimized header
- ✅ Touch-friendly interface

## 🔧 Technical Details

### Push Token Registration
- **Endpoint**: `POST /api/users/push-token`
- **Body**: `{ pushToken: string, platform: 'web' | 'mobile' }`
- **Auth**: Required (Bearer token)

### Notification API
- **Get Notifications**: `GET /api/notifications`
- **Unread Count**: `GET /api/notifications/unread-count`
- **Mark as Read**: `PATCH /api/notifications/:id/read`
- **Mark All Read**: `PATCH /api/notifications/read-all`
- **Clear All**: `DELETE /api/notifications/clear-all`

### Browser Notifications
- Uses native browser `Notification` API
- Works on Chrome, Firefox, Safari, Edge
- Requires HTTPS (or localhost for development)
- Shows system alerts even when browser is closed

## 🧪 Testing

### Test Admin Notifications

1. **Login as Admin**
   ```bash
   Email: admin@sejas.com
   Password: admin123
   ```

2. **Allow Notifications**
   - Browser will prompt for permission
   - Click "Allow"

3. **Place an Order** (as customer)
   - Admin should receive notification: "New Order Received! 📦"

4. **Accept Order** (as delivery boy)
   - Admin should receive notification: "Order Accepted for Delivery! 🚚"

### Test Delivery Boy Notifications

1. **Login as Delivery Boy**
   - Browser will prompt for permission
   - Click "Allow"

2. **Place an Order** (as customer)
   - Delivery boy should see order in available orders

3. **Accept Order** (as delivery boy)
   - Customer and admin should receive notifications

## 📝 Notes

- **Browser Compatibility**: Works on all modern browsers (Chrome, Firefox, Safari, Edge)
- **HTTPS Required**: Push notifications require HTTPS in production (localhost works for development)
- **Permission Required**: Users must allow notifications in browser
- **System Alerts**: Notifications appear even when browser/app is closed
- **Mobile Friendly**: Both apps are fully responsive and work great on mobile browsers

## 🐛 Troubleshooting

### Notifications Not Showing?

1. **Check Browser Permission**
   - Go to browser settings
   - Check if notifications are allowed for the site
   - Re-enable if needed

2. **Check Console**
   - Open browser DevTools
   - Look for notification-related errors
   - Check if push token is registered

3. **Check Backend Logs**
   - Verify notifications are being sent
   - Check if push tokens are stored in database

4. **Test Notification Permission**
   ```javascript
   // In browser console
   Notification.requestPermission().then(permission => {
     console.log('Permission:', permission);
   });
   ```

## 🎉 Features

✅ Real-time push notifications  
✅ System alerts (works when browser closed)  
✅ Mobile responsive design  
✅ Notification badges  
✅ Unread count tracking  
✅ Mark as read functionality  
✅ Clear all notifications  
✅ Works on mobile and desktop browsers  

