# 🚀 Vercel Deployment Guide for Admin App

## Quick Deploy Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click **"Add New..."** → **"Project"**

2. **Import GitHub Repository**
   - Select your repository: `prabii/SejasFresh`
   - Click **"Import"**

3. **Configure Project**
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `SejasFresh/MeatDeliveryAdmin`
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `dist` (auto-filled)
   - **Install Command**: `npm install` (auto-filled)

4. **Environment Variables** (if needed)
   - Click **"Environment Variables"**
   - Add if you have any:
     - `VITE_API_URL` (optional - defaults to Render backend)
     - `VITE_UPLOADS_URL` (optional - defaults to Render backend)

5. **Deploy**
   - Click **"Deploy"**
   - Wait 2-3 minutes for deployment

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to Admin directory
cd SejasFresh/MeatDeliveryAdmin

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No (first time) or Yes (if updating)
# - Project name: meat-delivery-admin (or your choice)
# - Directory: ./
# - Override settings? No
```

## 📋 Configuration

The `vercel.json` file is already configured with:
- ✅ Build command: `npm run build`
- ✅ Output directory: `dist`
- ✅ SPA routing (all routes → index.html)
- ✅ Asset caching headers

## 🔗 After Deployment

Once deployed, you'll get a URL like:
- `https://meat-delivery-admin.vercel.app`

The app will automatically use the Render backend:
- API: `https://meat-delivery-backend.onrender.com/api`
- Uploads: `https://meat-delivery-backend.onrender.com/uploads`

## 🔄 Updating Deployment

After pushing changes to GitHub:
- Vercel will automatically redeploy (if auto-deploy is enabled)
- Or manually trigger: Vercel Dashboard → Your Project → "Redeploy"

## 📝 Environment Variables (Optional)

If you need to override the backend URL, add in Vercel Dashboard:
- `VITE_API_URL` = `https://meat-delivery-backend.onrender.com/api`
- `VITE_UPLOADS_URL` = `https://meat-delivery-backend.onrender.com/uploads`

## ✅ Verification

After deployment, test:
1. Visit your Vercel URL
2. Login with admin credentials
3. Verify API calls work (check browser console)
4. Test creating/editing products, orders, etc.

---

**Note**: The Admin app is configured to use the Render backend by default, so no environment variables are required unless you want to override them.

