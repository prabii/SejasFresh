# 🔑 Render VAPID Keys Setup - URGENT

## ⚠️ CRITICAL: VAPID Keys Must Match

Your frontend and backend are using **different VAPID keys**, causing 403 errors.

## 🚀 Quick Fix

### Step 1: Go to Render Dashboard
1. Open: https://dashboard.render.com
2. Select your backend service: `meat-delivery-backend`
3. Go to: **Environment** tab

### Step 2: Add/Update These Environment Variables

**Copy and paste these EXACT values:**

```
VAPID_PUBLIC_KEY=BKPfMyj4jh2WTz_eda9BlcKOyWB1zfB84X2vmD9lnj4Ft9tijrVg6SsUMoDV6KAMY3HaLnhyb3NH829XBFn6Y5k
```

```
VAPID_PRIVATE_KEY=_1EbojjusnY26e4x7PPvh9-GOPorU_eryYrcGsxugmY
```

```
VAPID_SUBJECT=mailto:admin@sejas.com
```

### Step 3: Save and Restart
1. Click **Save Changes**
2. Render will automatically restart your service
3. Wait for deployment to complete (check logs)

### Step 4: Verify Frontend Matches

**Frontend `.env` already updated** with matching key:
```
VITE_VAPID_PUBLIC_KEY=BKPfMyj4jh2WTz_eda9BlcKOyWB1zfB84X2vmD9lnj4Ft9tijrVg6SsUMoDV6KAMY3HaLnhyb3NH829XBFn6Y5k
```

**Vercel will auto-deploy** and pick up the new key from GitHub.

## ✅ After Setup

1. **Admin logs out and logs back in**
   - This creates a new subscription with matching keys
   - Check browser console: `"✅ Push subscription registered"`

2. **Place an order**
   - Check Render logs: `"✅ Web push notification sent"` (not 403!)

3. **Admin receives notification**
   - Even with browser closed! 🎉

## 🔍 Verify Keys Match

**Frontend** (`.env` or Vercel):
- `VITE_VAPID_PUBLIC_KEY` = `BKPfMyj4jh2WTz_eda9BlcKOyWB1zfB84X2vmD9lnj4Ft9tijrVg6SsUMoDV6KAMY3HaLnhyb3NH829XBFn6Y5k`

**Backend** (Render):
- `VAPID_PUBLIC_KEY` = `BKPfMyj4jh2WTz_eda9BlcKOyWB1zfB84X2vmD9lnj4Ft9tijrVg6SsUMoDV6KAMY3HaLnhyb3NH829XBFn6Y5k`

**They MUST be identical!**

---

**Status**: ✅ Frontend updated, waiting for Render update!

