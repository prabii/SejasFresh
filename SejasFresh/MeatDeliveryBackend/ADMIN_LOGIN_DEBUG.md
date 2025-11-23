# Admin Login 401 Error - Debugging Guide

## Common Causes of 401 Error

### 1. **JWT_SECRET Not Set on Render**
The most common cause is missing or incorrect `JWT_SECRET` environment variable on Render.

**Check:**
- Go to your Render dashboard → Your backend service → Environment
- Verify `JWT_SECRET` is set and matches your local `.env` file
- If missing, add it: `JWT_SECRET=your-super-secret-jwt-key-change-this-in-production`

**Fix:**
```bash
# Generate a new JWT_SECRET (use a strong random string)
# Add it to Render environment variables
```

### 2. **Admin User Doesn't Exist**
The admin user might not exist in the database.

**Check:**
- Connect to your MongoDB database
- Run: `db.users.findOne({ role: "admin" })`

**Fix:**
```bash
# Run the createAdmin script
cd MeatDeliveryBackend
node src/scripts/createAdmin.js
```

**Default Admin Credentials:**
- Email: `admin@sejas.com`
- Password: `admin123`

### 3. **Admin User Has No Password**
The admin user exists but doesn't have a password set.

**Check:**
- In MongoDB: `db.users.findOne({ role: "admin" }, { password: 1 })`
- If password field is missing or null, this is the issue

**Fix:**
- Delete the admin user and recreate it using the script
- Or manually set a password in MongoDB

### 4. **Admin User is Inactive**
The admin user exists but `isActive` is set to `false`.

**Check:**
- In MongoDB: `db.users.findOne({ role: "admin" }, { isActive: 1 })`

**Fix:**
```javascript
// In MongoDB shell
db.users.updateOne(
  { role: "admin" },
  { $set: { isActive: true } }
)
```

### 5. **Token Verification Failing**
After login, the token verification (`/auth/me`) is failing.

**Check:**
- Open browser DevTools → Network tab
- Check the `/auth/me` request after login
- Look at the response status and error message

**Common Issues:**
- Token not being sent in Authorization header
- Token expired (check JWT_EXPIRE setting)
- JWT_SECRET mismatch between login and verification

## Debugging Steps

### Step 1: Check Browser Console
1. Open Admin Dashboard
2. Open DevTools (F12)
3. Go to Console tab
4. Look for error messages starting with:
   - `Admin login attempt:`
   - `Login response:`
   - `Token verification error:`

### Step 2: Check Network Tab
1. Open DevTools → Network tab
2. Try to login
3. Check the `/api/auth/login` request:
   - Status code (should be 200)
   - Response body (should have `success: true`)
   - Check if token is returned

4. Check the `/api/auth/me` request:
   - Status code (should be 200)
   - Response body (should have `success: true` and `user.role === 'admin'`)

### Step 3: Check Render Logs
1. Go to Render dashboard → Your backend service → Logs
2. Look for log messages when you try to login:
   - `Admin login attempt for email: [email]`
   - `User found: [id], Role: [role], Active: [active], Has Password: [true/false]`
   - `Admin login successful` or `Admin login failed: [reason]`

### Step 4: Verify Environment Variables on Render
1. Go to Render dashboard → Your backend service → Environment
2. Verify these are set:
   - `JWT_SECRET` - Must be set and match your local value
   - `MONGODB_URI` - Must be correct
   - `JWT_EXPIRE` - Optional, defaults to 7d

### Step 5: Test Admin User Creation
```bash
# SSH into Render or run locally with Render's MongoDB URI
cd MeatDeliveryBackend
node src/scripts/createAdmin.js
```

## Quick Fixes

### Fix 1: Recreate Admin User
```bash
# Connect to MongoDB
# Delete existing admin
db.users.deleteOne({ role: "admin" })

# Run createAdmin script
node src/scripts/createAdmin.js
```

### Fix 2: Reset Admin Password
```javascript
// In MongoDB shell
const bcrypt = require('bcryptjs');
const hashedPassword = await bcrypt.hash('admin123', 10);
db.users.updateOne(
  { role: "admin" },
  { 
    $set: { 
      password: hashedPassword,
      isActive: true,
      emailVerified: true,
      phoneVerified: true
    } 
  }
)
```

### Fix 3: Verify JWT_SECRET
```bash
# On Render, check environment variables
# Make sure JWT_SECRET is set and is a strong random string
# Example: JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-$(openssl rand -hex 32)
```

## Testing After Fix

1. Clear browser localStorage:
   ```javascript
   localStorage.removeItem('admin_token');
   ```

2. Try logging in with:
   - Email: `admin@sejas.com`
   - Password: `admin123`

3. Check browser console for:
   - `Admin login successful, token saved`
   - `Admin token verified, user set`

4. Check Render logs for:
   - `Admin login successful for user [id] ([email])`

## Still Having Issues?

If you're still getting 401 errors after checking all the above:

1. **Check the exact error message** in browser console and Render logs
2. **Verify the API URL** in Admin app is correct: `https://meat-delivery-backend.onrender.com/api`
3. **Check CORS** - Make sure Render allows requests from your Admin dashboard domain
4. **Check token format** - Token should be in format: `Bearer [token]`

## Contact Points

- Check Render service logs for detailed error messages
- Check browser DevTools Network tab for request/response details
- Check browser Console for frontend error messages

