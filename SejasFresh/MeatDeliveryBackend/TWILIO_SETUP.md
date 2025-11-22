# Twilio OTP Setup Guide

## 📱 How to Set Up Real OTP via Twilio

### Step 1: Create Twilio Account
1. Go to [https://www.twilio.com](https://www.twilio.com)
2. Sign up for a free account (includes $15.50 credit)
3. Verify your email and phone number

### Step 2: Get Twilio Credentials
1. Log in to Twilio Console
2. Go to **Dashboard**
3. Copy your **Account SID** and **Auth Token**
4. Go to **Phone Numbers** → **Manage** → **Buy a number** (or use trial number)
5. Copy your **Twilio Phone Number** (format: +1234567890)

### Step 3: Add to .env File
Add these variables to your `MeatDeliveryBackend/.env` file:

```env
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### Step 4: Restart Backend
```bash
cd MeatDeliveryBackend
npm run dev
```

## ✅ Testing

### With Twilio Configured:
- OTP will be sent as real SMS to the phone number
- Check your phone for the OTP message
- OTP format: "Your Sejas Fresh OTP is 123456. Valid for 5 minutes."

### Without Twilio (Development):
- OTP will be logged to console
- Check backend terminal for OTP
- Format: `📱 SMS to +91XXXXXXXXXX: Your OTP is 123456...`

## 🔒 Security Notes

1. **Never commit .env file** - It contains sensitive credentials
2. **Use environment variables** in production
3. **Twilio Trial Account** - Can only send to verified numbers
4. **Upgrade to paid** - To send to any number

## 📞 Twilio Trial Limitations

- Can only send SMS to **verified phone numbers**
- Add verified numbers in Twilio Console → Phone Numbers → Verified Caller IDs
- Upgrade account to send to any number

## 🚀 Production Setup

1. Upgrade Twilio account to paid
2. Purchase a phone number (if not using trial)
3. Set up proper error handling
4. Monitor SMS delivery rates
5. Consider rate limiting for OTP requests

---

**Note**: The app will work without Twilio (logs to console), but for production, Twilio is required for real SMS delivery.

