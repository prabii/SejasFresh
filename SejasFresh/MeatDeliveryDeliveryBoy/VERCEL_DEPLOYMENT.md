# 🚀 Deploy Delivery Boy App to Vercel

This guide will help you deploy the Delivery Boy web application to Vercel.

## 📋 Prerequisites

- A GitHub account
- A Vercel account (sign up at [vercel.com](https://vercel.com))
- The Delivery Boy app code pushed to a GitHub repository

## 🎯 Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com) and sign in
   - Click **"Add New..."** → **"Project"**

2. **Import Your Repository**
   - Connect your GitHub account if not already connected
   - Select the repository containing your Delivery Boy app
   - Click **"Import"**

3. **Configure Project Settings**
   - **Framework Preset**: Select **"Vite"** (or leave as auto-detected)
   - **Root Directory**: Set to `SejasFresh/MeatDeliveryDeliveryBoy`
     - Click **"Edit"** next to Root Directory
     - Enter: `SejasFresh/MeatDeliveryDeliveryBoy`
     - Click **"Continue"**
   - **Build Command**: `npm run build` (should be auto-detected)
   - **Output Directory**: `dist` (should be auto-detected)
   - **Install Command**: `npm install` (should be auto-detected)

4. **Environment Variables** (Optional)
   - The `vercel.json` file already includes the backend API URL in the build config
   - If you need to override it, add:
     - **Key**: `VITE_API_URL`
     - **Value**: `https://meat-delivery-backend.onrender.com/api`

5. **Deploy**
   - Click **"Deploy"**
   - Wait for the build to complete (usually 1-2 minutes)

6. **Access Your App**
   - Once deployed, Vercel will provide you with a URL like:
     `https://your-project-name.vercel.app`
   - Your app is now live! 🎉

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Navigate to Delivery Boy Directory**
   ```bash
   cd SejasFresh/MeatDeliveryDeliveryBoy
   ```

4. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts:
     - Set up and deploy? **Yes**
     - Which scope? (Select your account)
     - Link to existing project? **No** (for first deployment)
     - Project name? (Press Enter for default or enter custom name)
     - In which directory is your code located? **./** (current directory)
     - Override settings? **No**

5. **Production Deployment**
   ```bash
   vercel --prod
   ```

## 🔧 Configuration Files

### `vercel.json`
The `vercel.json` file is already configured with:
- **SPA Routing**: All routes redirect to `index.html` for client-side routing
- **Cache Headers**: Optimized caching for static assets
- **Build Environment**: Backend API URL configured

### Environment Variables
The backend API URL is configured in `vercel.json` build config:
```json
{
  "build": {
    "env": {
      "VITE_API_URL": "https://meat-delivery-backend.onrender.com/api"
    }
  }
}
```

## 🌐 Custom Domain (Optional)

1. Go to your project settings in Vercel Dashboard
2. Navigate to **"Domains"**
3. Add your custom domain
4. Follow DNS configuration instructions

## 🔄 Continuous Deployment

Vercel automatically deploys:
- **Production**: Every push to `main` or `master` branch
- **Preview**: Every push to other branches (creates preview deployments)

## 📝 Important Notes

1. **Root Directory**: Make sure to set the Root Directory to `SejasFresh/MeatDeliveryDeliveryBoy` in Vercel project settings
2. **Build Output**: The build output is in the `dist` folder (Vite default)
3. **API URL**: The backend API URL is configured to use Render: `https://meat-delivery-backend.onrender.com/api`
4. **SPA Routing**: All routes are configured to work with React Router (client-side routing)

## 🐛 Troubleshooting

### Build Fails
- Check that the Root Directory is set correctly
- Verify all dependencies are in `package.json`
- Check build logs in Vercel Dashboard

### API Calls Not Working
- Verify `VITE_API_URL` environment variable is set correctly
- Check browser console for CORS errors
- Ensure backend is deployed and accessible

### Routing Issues
- Verify `vercel.json` has the rewrite rule for SPA routing
- Check that React Router is configured correctly

## ✅ Post-Deployment Checklist

- [ ] App loads successfully
- [ ] Login functionality works
- [ ] API calls are successful (check Network tab)
- [ ] Dashboard displays correctly
- [ ] Orders page loads and displays data
- [ ] Notifications work
- [ ] All routes navigate correctly

## 🎉 Success!

Your Delivery Boy app is now deployed and accessible via Vercel!

**Next Steps:**
- Share the Vercel URL with your delivery team
- Set up a custom domain if needed
- Monitor deployments and logs in Vercel Dashboard

