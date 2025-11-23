# 🔑 VAPID Key Verification Guide

## 🚨 Current Issue

The subscription is being saved successfully, but when sending notifications, you get:
```
403: "the VAPID credentials in the authorization header do not correspond to the credentials used to create the subscriptions."
```

**This means**: Frontend and Backend are using **different VAPID keys**.

## ✅ Solution: Verify Keys Match

### Step 1: Check Frontend VAPID Key

**In `MeatDeliveryAdmin/.env`**:
```env
VITE_VAPID_PUBLIC_KEY=BNne-lzAkHYi5jyn8x3b8fiFNmQWBA3dfo0xxSMsXC2lGZlGpmtd-eoTzm2XXMCjipDQ4GugehP6ZaSopqVUGSo
```

**Or in Vercel Dashboard**:
- Go to: Project → Settings → Environment Variables
- Look for: `VITE_VAPID_PUBLIC_KEY`
- Copy the value

### Step 2: Check Backend VAPID Keys

**In Render Dashboard**:
- Go to: Your Backend Service → Environment
- Look for:
  - `VAPID_PUBLIC_KEY` (should match frontend)
  - `VAPID_PRIVATE_KEY` (backend only)
  - `VAPID_SUBJECT` (should be `mailto:admin@sejas.com`)

### Step 3: Compare Keys

**The `VAPID_PUBLIC_KEY` in Render MUST match `VITE_VAPID_PUBLIC_KEY` in Vercel/.env**

If they don't match:
1. **Option A**: Update Render to match frontend
   - Copy `VITE_VAPID_PUBLIC_KEY` from `.env`
   - Paste as `VAPID_PUBLIC_KEY` in Render
   - Generate matching private key (see below)

2. **Option B**: Update frontend to match backend
   - Copy `VAPID_PUBLIC_KEY` from Render
   - Update `.env` and Vercel environment variables

## 🔧 Generate Matching Keys

If keys don't match, generate new matching keys:

```bash
cd MeatDeliveryBackend
node src/scripts/generateVAPIDKeys.js
```

This will output:
- `VAPID_PUBLIC_KEY` → Use in **both** frontend and backend
- `VAPID_PRIVATE_KEY` → Use **only** in backend (Render)

## 📋 Quick Checklist

- [ ] Frontend `.env` has `VITE_VAPID_PUBLIC_KEY`
- [ ] Vercel has `VITE_VAPID_PUBLIC_KEY` (same value)
- [ ] Render has `VAPID_PUBLIC_KEY` (matches frontend)
- [ ] Render has `VAPID_PRIVATE_KEY` (matching private key)
- [ ] Render has `VAPID_SUBJECT=mailto:admin@sejas.com`
- [ ] All services restarted/redeployed after adding keys

## 🧪 Test After Fix

1. **Admin logs out and logs back in**
   - This creates a new subscription with correct keys
   - Check browser console for: `"✅ Push subscription registered with backend"`

2. **Place an order**
   - Check backend logs for: `"✅ Web push notification sent"` (not 403 error)

3. **Admin receives notification**
   - Even with browser closed!

## ⚠️ Important Notes

- **VAPID keys are paired** - Public and Private keys must match
- **Public key is safe** to expose (frontend)
- **Private key is secret** (backend only)
- **Changing keys** requires users to re-subscribe (automatic on next login)

---

**Current Frontend Key** (from `.env`):
```
BNne-lzAkHYi5jyn8x3b8fiFNmQWBA3dfo0xxSMsXC2lGZlGpmtd-eoTzm2XXMCjipDQ4GugehP6ZaSopqVUGSo
```

**Make sure Render `VAPID_PUBLIC_KEY` matches this exactly!**

