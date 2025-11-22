# 🔓 OTP Bypass for Development

## ✅ Bypass OTP Configured

For development and testing purposes, **OTP "123456"** is now accepted as a valid OTP for all verification endpoints.

## 📋 How It Works

### **Bypass OTP: `123456`**

This OTP will work for:
- ✅ Login OTP verification
- ✅ Registration OTP verification  
- ✅ PIN reset OTP verification

### **Usage:**

1. **Request OTP** (normal flow):
   ```bash
   POST /api/auth/request-otp
   {
     "phone": "+911234567890"
   }
   ```

2. **Verify with Bypass OTP:**
   ```bash
   POST /api/auth/verify-otp
   {
     "phone": "+911234567890",
     "otp": "123456"  // ← Bypass OTP
   }
   ```

3. **Result:**
   - ✅ OTP verified successfully
   - ✅ User logged in/registered
   - ⚠️  Console log: "BYPASS OTP USED"

## 🔍 What Happens

### **With Bypass OTP (123456):**
- ✅ Always accepted (no expiration check)
- ✅ Works even if no OTP was requested
- ✅ Logs to console for tracking
- ✅ User must still exist (for login/reset)

### **With Real OTP:**
- ✅ Normal verification flow
- ✅ Expiration check (5 minutes)
- ✅ Must match stored OTP code

## ⚠️ Important Notes

1. **Development Only:**
   - This bypass is for development/testing
   - Remove or disable in production
   - Consider adding environment check

2. **Security:**
   - Bypass OTP is logged to console
   - User must still exist in database
   - Phone number must be valid

3. **Testing:**
   - Use bypass OTP for quick testing
   - Test real OTP flow separately
   - Verify production builds don't use bypass

## 🚀 Quick Test

```bash
# 1. Request OTP (optional - bypass works without it)
curl -X POST http://localhost:5000/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+911234567890"}'

# 2. Verify with bypass OTP
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+911234567890", "otp": "123456"}'
```

## 📝 Endpoints with Bypass

1. **POST /api/auth/verify-otp** - Login/Registration
2. **POST /api/auth/reset-pin** - PIN Reset

## 🔒 Production Recommendation

Before deploying to production, consider:

1. **Add environment check:**
   ```javascript
   const BYPASS_OTP = process.env.NODE_ENV === 'development' ? '123456' : null;
   ```

2. **Or disable completely:**
   ```javascript
   // Remove bypass OTP check in production
   ```

3. **Or use feature flag:**
   ```javascript
   const ENABLE_BYPASS_OTP = process.env.ENABLE_BYPASS_OTP === 'true';
   ```

---

**Status**: ✅ Bypass OTP "123456" is active for all OTP verifications.

