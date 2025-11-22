# 🚀 Render Deployment Guide

This guide will help you deploy the Meat Delivery Backend to Render.

## 📋 Prerequisites

1. A GitHub account with the code pushed to a repository
2. A Render account (sign up at https://render.com)
3. MongoDB Atlas database (or your MongoDB connection string)

## 🔧 Step-by-Step Deployment

### Step 1: Prepare Your Repository

Make sure your code is pushed to GitHub (already done ✅).

### Step 2: Create a New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select your repository: `prabii/SejasFresh`
5. Configure the service:
   - **Name**: `meat-delivery-backend` (or any name you prefer)
   - **Root Directory**: `SejasFresh/MeatDeliveryBackend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Choose `Free` (or upgrade if needed)

### Step 3: Configure Environment Variables

In the Render dashboard, go to **Environment** section and add these variables:

#### Required Variables:

```
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/meatdelivery?retryWrites=true&w=majority
```

```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

#### Optional Variables (with defaults):

```
NODE_ENV=production
PORT=5000
JWT_EXPIRE=7d
OTP_EXPIRE_MINUTES=5
MAX_FILE_SIZE=5242880
CORS_ORIGIN=*
```

#### Optional: Twilio Configuration (if using SMS OTP):

```
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Run `npm install`
   - Start your server with `npm start`
3. Wait for the deployment to complete (usually 2-5 minutes)

### Step 5: Verify Deployment

Once deployed, you'll get a URL like: `https://meat-delivery-backend.onrender.com`

Test the health endpoint:
```
https://your-app-name.onrender.com/health
```

You should see:
```json
{
  "status": "ok",
  "message": "Meat Delivery API is running",
  "timestamp": "2024-..."
}
```

## 📝 Important Notes

### 1. MongoDB Connection
- Make sure your MongoDB Atlas allows connections from anywhere (0.0.0.0/0) or add Render's IP addresses
- The connection string should be in the format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`

### 2. File Uploads
- Render's free tier has ephemeral file storage (files are deleted on restart)
- For production, consider using:
  - AWS S3
  - Cloudinary
  - Or another cloud storage service
- Update the upload middleware to use cloud storage instead of local filesystem

### 3. CORS Configuration
- Update `CORS_ORIGIN` to your frontend URL(s) in production
- For multiple origins, use comma-separated values or configure in server.js

### 4. Environment Variables Security
- Never commit `.env` files to Git
- Always set sensitive variables in Render dashboard
- Use strong, random values for `JWT_SECRET`

### 5. Free Tier Limitations
- Render free tier services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Consider upgrading to paid plan for production

## 🔄 Updating Your Deployment

1. Push changes to your GitHub repository
2. Render will automatically detect changes and redeploy
3. Or manually trigger deployment from Render dashboard

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure `package.json` has correct `start` script
- Verify Node.js version compatibility

### Application Crashes
- Check runtime logs in Render dashboard
- Verify all environment variables are set
- Ensure MongoDB connection string is correct

### Database Connection Issues
- Verify MongoDB Atlas network access settings
- Check if connection string is correct
- Ensure database user has proper permissions

### Static Files Not Serving
- Remember: Render's free tier has ephemeral storage
- Consider migrating to cloud storage for production

## 📞 API Endpoints

Once deployed, your API will be available at:
- Base URL: `https://your-app-name.onrender.com`
- Health Check: `https://your-app-name.onrender.com/health`
- API Routes: `https://your-app-name.onrender.com/api/*`

Example:
- Login: `POST https://your-app-name.onrender.com/api/auth/login`
- Products: `GET https://your-app-name.onrender.com/api/products`

## ✅ Next Steps

1. Update your frontend applications to use the Render URL
2. Test all API endpoints
3. Set up monitoring and alerts
4. Consider upgrading to paid plan for production use

---

**Need Help?** Check Render's documentation: https://render.com/docs

