# 📋 Render Environment Variables Setup Guide

## ⚠️ Important Note

Render doesn't support direct `.env` file uploads. You need to add environment variables manually through the Render dashboard. However, I've created a helper script to make this easier!

## 🚀 Quick Setup Method

### Option 1: Use the Helper Script (Recommended)

1. Run this command in your backend directory:
```bash
cd SejasFresh/MeatDeliveryBackend
node prepare-render-env.js
```

This will read your `.env` file and display all variables in a format that's easy to copy-paste into Render.

### Option 2: Manual Entry

Copy each variable from your `.env` file and add it to Render:

1. Go to Render Dashboard → Your Service → **Environment** tab
2. Click **"Add Environment Variable"**
3. Copy each KEY and VALUE from your `.env` file

## 📝 Required Variables for Render

Based on your setup, make sure you have these variables in Render:

### ✅ Essential Variables:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A strong random secret (generate a new one for production!)

### ✅ Recommended Variables:
- `NODE_ENV=production`
- `PORT=5000` (Render sets this automatically, but you can override)
- `JWT_EXPIRE=7d`
- `OTP_EXPIRE_MINUTES=5`
- `MAX_FILE_SIZE=5242880`
- `CORS_ORIGIN=*` (or your frontend URL)

### ⚙️ Optional Variables:
- `TWILIO_ACCOUNT_SID` (if using SMS)
- `TWILIO_AUTH_TOKEN` (if using SMS)
- `TWILIO_PHONE_NUMBER` (if using SMS)

## 🔐 Security Reminder

**IMPORTANT**: 
- Never commit your `.env` file to Git (it's already in `.gitignore` ✅)
- Generate a NEW `JWT_SECRET` for production (don't use your development secret)
- Keep your MongoDB URI secure

## 📖 Step-by-Step in Render Dashboard

1. **Navigate to Environment Tab**
   - Go to your service in Render dashboard
   - Click on **"Environment"** in the left sidebar

2. **Add Each Variable**
   - Click **"Add Environment Variable"**
   - Enter the **Key** (variable name)
   - Enter the **Value** (variable value)
   - Click **"Save"**

3. **Repeat for All Variables**
   - Add all variables from your `.env` file
   - Make sure `MONGODB_URI` and `JWT_SECRET` are included

4. **Save and Deploy**
   - After adding all variables, Render will automatically redeploy
   - Check the logs to ensure everything works

## ✅ Verification

After deployment, test your API:
```
https://your-app-name.onrender.com/health
```

You should see:
```json
{
  "status": "ok",
  "message": "Meat Delivery API is running",
  "timestamp": "..."
}
```

---

**Need Help?** Run `node prepare-render-env.js` to see your variables formatted for easy copying!

