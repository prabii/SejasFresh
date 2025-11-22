# 🔧 Environment Variables Setup

## ✅ .env File Created

The `.env` file has been created with all required configuration including your MongoDB Atlas connection string.

## 📋 Environment Variables Included

### ✅ Server Configuration
- `PORT=5000` - Server port
- `NODE_ENV=development` - Environment mode

### ✅ MongoDB Configuration
- `MONGODB_URI` - Your MongoDB Atlas connection string (already configured)

### ✅ JWT Configuration
- `JWT_SECRET` - Secret key for JWT tokens (change in production!)
- `JWT_EXPIRE=7d` - Token expiration time

### ✅ OTP Configuration
- `OTP_EXPIRE_MINUTES=5` - OTP expiration time

### ✅ File Upload Configuration
- `UPLOAD_DIR=./uploads` - Directory for uploaded images
- `MAX_FILE_SIZE=5242880` - Max file size (5MB)
- `ALLOWED_FILE_TYPES` - Allowed image formats

### ✅ CORS Configuration
- `CORS_ORIGIN` - Allowed origins for CORS

### ⚙️ Optional Configuration
- **Twilio** - For SMS OTP (optional, currently uses console.log in dev)
  - `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
  - `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token
  - `TWILIO_PHONE_NUMBER` - Your Twilio phone number (format: +1234567890)
  - See `TWILIO_SETUP.md` for detailed setup instructions
- **Email** - For email OTP (optional, currently uses console.log in dev)

## 🚀 Ready to Start

Your backend is now fully configured! Just run:

```bash
cd MeatDeliveryBackend
npm install
npm run dev
```

The server will:
- ✅ Connect to MongoDB Atlas automatically
- ✅ Start on port 5000
- ✅ Serve API at `http://localhost:5000/api`
- ✅ Serve uploads at `http://localhost:5000/uploads`

## 🔐 Security Notes

1. **JWT_SECRET**: Change this to a strong random string in production
2. **MongoDB URI**: Already configured with your credentials
3. **Admin Credentials**: Change default admin password after first login

## 📝 Next Steps

1. Install dependencies: `npm install`
2. Start the server: `npm run dev`
3. Test the API: Visit `http://localhost:5000/health`
4. Create admin user via API or directly in MongoDB

