# 🔍 Admin Push Notification Debug Guide

## 🎯 Problem
Admin is not receiving push notifications on website or mobile browser.

## ✅ Step-by-Step Debugging

### Step 1: Check Browser Console (Most Important!)

**Open Admin Dashboard → Press F12 → Console Tab**

Look for these messages:

#### ✅ Success Messages:
```
🔔 Starting push notification registration...
✅ Notification permission granted
Service worker registered: /
Push subscription created
📤 Sending subscription to backend...
✅ Push subscription registered with backend successfully!
```

#### ❌ Error Messages to Look For:
```
❌ Browser does not support service workers or push notifications
⚠️ Notification permission not granted: denied
❌ Authentication required. Please log in again.
❌ VAPID_PUBLIC_KEY not configured
```

### Step 2: Check Service Worker Registration

**DevTools → Application → Service Workers**

- Should see `/sw.js` registered and **activated**
- Status should be **"activated and is running"**
- If not, click "Unregister" then refresh page

### Step 3: Check Push Subscription

**DevTools → Application → Service Workers → Click on `/sw.js` → Push**

- Should see a subscription with endpoint starting with `https://fcm.googleapis.com/...`
- If empty, subscription not created

**OR run in console:**
```javascript
navigator.serviceWorker.getRegistration().then(r => {
  return r.pushManager.getSubscription();
}).then(s => {
  console.log('Subscription:', s ? '✅ Active' : '❌ Not subscribed');
  if (s) console.log('Endpoint:', s.endpoint);
});
```

### Step 4: Check Backend Logs (Render)

When admin logs in, should see:
```
✅ Web push subscription saved for user [admin_id] (endpoint: https://fcm.googleapis.com/...)
```

When order is placed, should see:
```
✅ Web push notification sent to user [admin_id] (Admin Name): New Order Received! 📦
```

**NOT:**
```
No push token or subscription for user [admin_id]
Web push error: 403
```

### Step 5: Verify VAPID Keys Match

**Frontend** (`.env` or Vercel):
```
VITE_VAPID_PUBLIC_KEY=BKPfMyj4jh2WTz_eda9BlcKOyWB1zfB84X2vmD9lnj4Ft9tijrVg6SsUMoDV6KAMY3HaLnhyb3NH829XBFn6Y5k
```

**Backend** (Render Environment Variables):
```
VAPID_PUBLIC_KEY=BKPfMyj4jh2WTz_eda9BlcKOyWB1zfB84X2vmD9lnj4Ft9tijrVg6SsUMoDV6KAMY3HaLnhyb3NH829XBFn6Y5k
```

**They MUST match exactly!**

## 🔧 Common Fixes

### Fix 1: Permission Denied
**Problem**: `⚠️ Notification permission not granted: denied`

**Solution**:
1. Click browser address bar → Click lock icon → Site settings
2. Set "Notifications" to "Allow"
3. Refresh page and log in again

### Fix 2: Service Worker Not Registered
**Problem**: No service worker in DevTools

**Solution**:
1. Check `public/sw.js` exists
2. Check Vercel is serving it (Network tab → `sw.js` → should return 200)
3. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Fix 3: VAPID Key Not Configured
**Problem**: `❌ VAPID_PUBLIC_KEY not configured`

**Solution**:
1. Check `.env` file has `VITE_VAPID_PUBLIC_KEY`
2. Check Vercel environment variables
3. Redeploy Vercel app

### Fix 4: Authentication Error
**Problem**: `❌ Authentication required`

**Solution**:
1. Log out and log back in
2. Check token is valid in localStorage: `localStorage.getItem('admin_token')`
3. Check backend logs for auth errors

### Fix 5: VAPID Key Mismatch (403 Error)
**Problem**: `Web push error: 403`

**Solution**:
1. Verify Render `VAPID_PUBLIC_KEY` matches frontend `VITE_VAPID_PUBLIC_KEY`
2. Update Render environment variables if needed
3. Restart Render service
4. Admin logs out and logs back in (re-subscribes)

## 🧪 Test Flow

1. **Admin logs in**
   - Check browser console for registration messages
   - Check DevTools → Application → Service Workers for subscription

2. **Place order as customer**
   - Check Render logs for: `✅ Web push notification sent`
   - Admin should receive notification (even with browser closed!)

3. **Check notification appears**
   - Should see system notification
   - Click notification → Should open admin dashboard

## 📱 Mobile Browser Testing

**Chrome/Edge on Android:**
- ✅ Full support
- Follow same steps as desktop

**Safari on iOS:**
- ⚠️ Requires APNs setup (different from Web Push)
- Web Push API not fully supported

**Chrome on iOS:**
- ❌ Web Push not supported
- Use polling fallback (already implemented)

## 🚨 Still Not Working?

Provide these logs:

1. **Browser Console** (all messages)
2. **Service Worker Status** (DevTools → Application → Service Workers)
3. **Backend Logs** (when admin logs in and when order is placed)
4. **Network Tab** (check `/users/push-subscription` request/response)

---

**Quick Test Command (Browser Console):**
```javascript
// Test manual notification
navigator.serviceWorker.getRegistration().then(reg => {
  reg.showNotification('Test Notification', {
    body: 'If you see this, notifications work!',
    icon: '/favicon.png'
  });
});
```

If this works, the issue is with backend sending. If not, the issue is with frontend registration.

