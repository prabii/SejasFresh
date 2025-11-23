# 🔍 Web Push Notification Troubleshooting Guide

## 🚨 ROOT CAUSE IDENTIFIED

**Critical Issue**: Your backend uses **Expo SDK** (for mobile apps) but your admin web app generates **fake web tokens** that are NOT valid Expo push tokens. The backend rejects them with `Expo.isExpoPushToken()` validation.

**Secondary Issue**: No service worker = notifications only work when browser tab is open (not when closed/phone locked).

---

## ✅ PRIORITIZED CHECKLIST (Run These Now)

### 1. **Backend Token Validation Failure** ⚠️ MOST LIKELY
- **Check**: Backend logs show `"Invalid Expo push token"` when order is placed
- **Test**: Check Render logs for: `Invalid Expo push token for user [admin_id]: web_...`
- **Fix**: Implement Web Push API with VAPID keys (see below)

### 2. **No Push Token Stored** 
- **Check**: Database query: `db.users.findOne({ role: "admin" }, { pushToken: 1 })`
- **Expected**: Should see `pushToken: "web_..."` or `null`
- **If null**: Token registration failed

### 3. **Token Registration Failed**
- **Check**: Browser console for `"Error registering push token"`
- **Test**: Open DevTools → Console → Look for registration errors
- **Fix**: Check API endpoint `/api/users/push-token` returns 200

### 4. **No Service Worker** ⚠️ CRITICAL
- **Check**: DevTools → Application → Service Workers → Should see registered worker
- **Current**: You have NO service worker = notifications only work when tab open
- **Fix**: Must implement service worker for background notifications

### 5. **Notification Permission Denied**
- **Check**: Browser console: `Notification.permission` should be `"granted"`
- **Test**: `await Notification.requestPermission()` in console
- **Fix**: User must click "Allow" when prompted

### 6. **Backend Not Finding Admin Users**
- **Check**: Backend logs show `"No users with role 'admin' and push tokens found"`
- **Test**: Verify admin user exists: `db.users.find({ role: "admin" })`
- **Fix**: Ensure admin has `pushToken` field set

### 7. **Expo SDK Rejecting Web Tokens**
- **Check**: Backend code line 31: `if (!Expo.isExpoPushToken(user.pushToken))`
- **Expected Error**: `"Invalid Expo push token"`
- **Fix**: Web tokens don't match Expo format → Need Web Push API

### 8. **HTTPS Required**
- **Check**: Admin app URL must be HTTPS (Vercel provides this)
- **Test**: `window.location.protocol === 'https:'`
- **Fix**: Vercel should handle HTTPS automatically

### 9. **Polling Not Working**
- **Check**: NotificationContext polls every 30s but only shows in-app notifications
- **Current**: Only works when tab is open
- **Fix**: Need service worker for background delivery

### 10. **Browser Compatibility**
- **Check**: Chrome/Firefox/Edge support Web Push; Safari requires APNs; Chrome iOS doesn't support
- **Test**: Check browser version and OS
- **Fix**: Use Web Push API (not Expo) for web browsers

---

## 🧪 IMMEDIATE TESTS TO RUN

### Test 1: Check Backend Logs (Most Important)
```bash
# In Render dashboard → Logs, look for when order is placed:
# Expected error:
"Invalid Expo push token for user [admin_id]: web_1234567890_abc123"
```

### Test 2: Check Database Token
```javascript
// In MongoDB shell or MongoDB Compass
db.users.findOne({ role: "admin" }, { pushToken: 1, email: 1 })
// If pushToken is null or starts with "web_", that's the problem
```

### Test 3: Browser Console Test
```javascript
// In admin browser console (DevTools → Console)
// 1. Check permission
Notification.permission  // Should be "granted"

// 2. Check stored token
localStorage.getItem('admin_push_token')  // Should show "web_..."

// 3. Test manual notification
new Notification('Test', { body: 'If you see this, browser notifications work' })
```

### Test 4: Backend API Test
```bash
# Get admin user ID first, then:
curl -X POST https://meat-delivery-backend.onrender.com/api/users/push-token \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pushToken": "web_test_123", "platform": "web"}'

# Should return: {"success": true, "message": "Push token updated"}
```

---

## 🔧 ROOT CAUSES & FIXES

### Root Cause #1: Expo SDK Doesn't Support Web Tokens
**Problem**: 
- Backend uses `expo-server-sdk` which only accepts Expo push tokens (format: `ExponentPushToken[...]`)
- Frontend generates fake tokens: `web_1234567890_abc123`
- Backend validation fails: `Expo.isExpoPushToken("web_...")` → `false`

**Expected Error**:
```
Invalid Expo push token for user 507f1f77bcf86cd799439011: web_1234567890_abc123
```

**Fix**: Implement Web Push API with VAPID keys (see implementation below)

### Root Cause #2: No Service Worker = No Background Notifications
**Problem**:
- Current code uses `new Notification()` which only works when tab is open
- No service worker = no background push delivery
- Phone locked = no notifications

**Expected Behavior**:
- Notifications only appear when admin tab is open
- No notifications when browser closed or phone locked

**Fix**: Implement service worker with Web Push API (see below)

---

## 💻 CODE FIXES REQUIRED

### Option A: Implement Web Push API (Recommended)

#### Step 1: Install Dependencies
```bash
cd MeatDeliveryBackend
npm install web-push
```

#### Step 2: Generate VAPID Keys
```bash
npx web-push generate-vapid-keys
# Save public and private keys
```

#### Step 3: Create Service Worker (`public/sw.js`)
```javascript
// MeatDeliveryAdmin/public/sw.js
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Sejas Fresh';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/favicon.png',
    badge: '/favicon.png',
    tag: 'sejas-admin',
    data: data.metadata || {},
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const data = event.notification.data;
  const url = data?.screen === 'orders' ? '/orders' : '/';
  
  event.waitUntil(
    clients.openWindow(url)
  );
});
```

#### Step 4: Update Frontend Notification Service
```typescript
// MeatDeliveryAdmin/src/services/notificationService.ts
import api from './api';

const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY_HERE'; // From Step 2

class NotificationService {
  async registerForPushNotifications(): Promise<string | null> {
    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return null;
      }

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      // Send subscription to backend
      const response = await api.post('/users/push-subscription', {
        subscription: subscription.toJSON(),
        platform: 'web'
      });

      console.log('Push subscription registered');
      localStorage.setItem('admin_push_subscription', JSON.stringify(subscription));
      return JSON.stringify(subscription);
    } catch (error) {
      console.error('Error registering push notifications:', error);
      return null;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}
```

#### Step 5: Update Backend Push Notification
```javascript
// MeatDeliveryBackend/src/utils/pushNotification.js
const webpush = require('web-push');
const { Expo } = require('expo-server-sdk');
const User = require('../models/User');

// Set VAPID keys (from Step 2)
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = 'mailto:admin@sejas.com'; // Your contact email

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    const user = await User.findById(userId).select('pushToken pushSubscription firstName');
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Check if web push subscription exists
    if (user.pushSubscription) {
      try {
        const subscription = typeof user.pushSubscription === 'string' 
          ? JSON.parse(user.pushSubscription) 
          : user.pushSubscription;
        
        await webpush.sendNotification(subscription, JSON.stringify({
          title: `Sejas Fresh: ${title}`,
          body: body,
          icon: '/favicon.png',
          badge: '/favicon.png',
          data: {
            ...data,
            userId: userId.toString(),
            url: data.screen === 'orders' ? '/orders' : '/'
          }
        }));
        
        console.log(`✅ Web push sent to user ${userId}`);
        return { success: true };
      } catch (error) {
        console.error(`Web push error for user ${userId}:`, error);
        // Fall through to try Expo token
      }
    }

    // Fallback to Expo for mobile apps
    if (user.pushToken && Expo.isExpoPushToken(user.pushToken)) {
      // ... existing Expo code ...
    }

    return { success: false, error: 'No valid push token/subscription' };
  } catch (error) {
    console.error('Error in sendPushNotification:', error);
    return { success: false, error: error.message };
  }
};
```

#### Step 6: Update User Model
```javascript
// MeatDeliveryBackend/src/models/User.js
// Add to schema:
pushSubscription: {
  type: mongoose.Schema.Types.Mixed, // Store Web Push subscription object
  default: null
}
```

#### Step 7: Update Push Token Endpoint
```javascript
// MeatDeliveryBackend/src/controllers/userController.js
exports.updatePushSubscription = async (req, res, next) => {
  try {
    const { subscription, platform } = req.body;

    if (platform === 'web' && subscription) {
      req.user.pushSubscription = subscription;
      await req.user.save();
    } else {
      req.user.pushToken = subscription?.pushToken || req.body.pushToken;
      await req.user.save();
    }

    res.json({
      success: true,
      message: 'Push subscription updated'
    });
  } catch (error) {
    next(error);
  }
};
```

---

## 📋 WHAT TO PASTE BACK

If the above doesn't fix it, provide:

1. **Backend Logs** (from Render):
   - When order is placed, copy the exact log lines
   - Look for: "Invalid Expo push token", "No push token", "Error sending"

2. **Browser Console Logs**:
   - Open DevTools → Console
   - Filter: "push", "notification", "error"
   - Copy all relevant lines

3. **Network Tab**:
   - DevTools → Network
   - Filter: "push-token" or "push-subscription"
   - Check request/response for `/api/users/push-token`

4. **Database Query Result**:
   ```javascript
   db.users.findOne({ role: "admin" }, { pushToken: 1, pushSubscription: 1, email: 1 })
   ```

5. **Service Worker Status**:
   - DevTools → Application → Service Workers
   - Screenshot or describe what you see

6. **Browser & OS Info**:
   - Browser: Chrome/Firefox/Safari/Edge
   - Version: (check in about:version)
   - OS: Windows/Mac/iOS/Android
   - Device: Desktop/Mobile

---

## 🎯 QUICK FIX COMMANDS

### Test Backend Push Sending
```bash
# In Render logs or local backend, check:
# When order placed, should see:
"✅ Push notification sent to user [admin_id]"
# OR
"Invalid Expo push token for user [admin_id]: web_..."
```

### Test Frontend Registration
```javascript
// In browser console on admin site:
const service = await import('./services/notificationService');
const token = await service.notificationService.registerForPushNotifications();
console.log('Token:', token);
```

---

## ⚠️ PLATFORM CAVEATS

- **Chrome iOS**: Doesn't support Web Push API (use APNs or fallback to polling)
- **Safari**: Requires APNs setup (different from Web Push)
- **Android Chrome**: Full Web Push support
- **Desktop**: Full support on Chrome/Firefox/Edge

---

## 🚀 NEXT STEPS

1. **Immediate**: Check backend logs for "Invalid Expo push token" error
2. **Quick Fix**: Implement Web Push API with VAPID (see code above)
3. **Alternative**: Use OneSignal/Firebase which handles both mobile and web
4. **Fallback**: Keep polling but add service worker for better UX

---

## ❓ WHAT I NEED FROM YOU

1. **Backend logs** when order is placed (especially any "Invalid Expo push token" errors)
2. **Browser console logs** from admin site (any errors?)
3. **Database query result**: `db.users.findOne({ role: "admin" }, { pushToken: 1 })`
4. **Browser/OS info**: What browser and device is admin using?
5. **Service worker status**: Do you see any service worker registered? (DevTools → Application → Service Workers)

Once you provide these, I can give you the exact fix!

