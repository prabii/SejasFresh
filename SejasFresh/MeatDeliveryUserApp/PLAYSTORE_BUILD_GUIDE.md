# 📱 Google Play Store Build Guide

## 🎯 Prerequisites

1. **Expo Account**: Sign up at https://expo.dev (free)
2. **EAS CLI**: Install globally
   ```bash
   npm install -g eas-cli
   ```
3. **Google Play Console Account**: 
   - Create at https://play.google.com/console
   - Pay one-time $25 registration fee
   - Create your app listing

## 🚀 Step-by-Step Build Process

### Step 1: Login to Expo

```bash
cd MeatDeliveryUserApp
eas login
```

Enter your Expo account credentials.

### Step 2: Configure EAS Build (if not already done)

Your `eas.json` should have production build configuration. Verify it exists and is correct.

### Step 3: Update App Version (Important!)

Before building, update version in `app.json`:

```json
{
  "expo": {
    "version": "1.0.1",  // Update this for each release
    "android": {
      "versionCode": 2  // Increment this for each build (must be higher than previous)
    }
  }
}
```

**Version Code Rules:**
- Must be an integer
- Must be higher than previous version
- Increment by 1 for each build (2, 3, 4, etc.)

### Step 4: Build Android App Bundle (AAB) for Play Store

**For Production Release:**
```bash
eas build --platform android --profile production
```

**For Internal Testing (Recommended First):**
```bash
eas build --platform android --profile preview
```

### Step 5: Monitor Build Progress

- Build will start on Expo servers
- You'll get a URL to track progress
- Build takes 15-30 minutes typically
- You'll receive email when complete

### Step 6: Download Build

Once build completes:
1. Go to https://expo.dev
2. Navigate to your project
3. Go to "Builds" tab
4. Download the `.aab` file (Android App Bundle)

### Step 7: Upload to Google Play Console

1. **Go to Google Play Console**: https://play.google.com/console
2. **Select your app** (or create new app)
3. **Go to**: Production → Create new release
4. **Upload**: The `.aab` file you downloaded
5. **Fill in release notes**:
   ```
   Initial release of Sejas Fresh
   - Order meat products online
   - Real-time order tracking
   - Push notifications
   - Multiple payment options
   ```
6. **Review and publish**

## 📋 Pre-Submission Checklist

### ✅ App Information

- [ ] App name: "Sejas Fresh"
- [ ] Package name: `com.batman1428.MeatDeliveryUserApp`
- [ ] App icon: `./assets/images/icon.png` (1024x1024px)
- [ ] App version: `1.0.1`
- [ ] Version code: `2` (or higher)

### ✅ Required Assets

- [ ] **App Icon**: 1024x1024px PNG (no transparency)
- [ ] **Feature Graphic**: 1024x500px PNG
- [ ] **Screenshots**: 
  - Phone: At least 2 screenshots (min 320px, max 3840px)
  - Tablet (optional): At least 2 screenshots
- [ ] **Privacy Policy URL**: Required for apps with user data

### ✅ Content Rating

- [ ] Complete content rating questionnaire
- [ ] App is rated appropriately

### ✅ Store Listing

- [ ] **Short description**: 80 characters max
  ```
  Order fresh meat online with Sejas Fresh. Fast delivery, quality products.
  ```
- [ ] **Full description**: 4000 characters max
  ```
  Sejas Fresh - Your trusted online meat delivery platform
  
  Features:
  - Browse fresh meat products
  - Easy ordering with multiple payment options
  - Real-time order tracking
  - Push notifications for order updates
  - Save multiple delivery addresses
  - Apply coupons and discounts
  - View order history
  
  Download now and get fresh meat delivered to your doorstep!
  ```

### ✅ App Permissions

Your app requests these permissions (already configured):
- Internet (required)
- Network state (required)
- Location (for address auto-fill)
- Notifications (for order updates)
- Vibrate (for notifications)

### ✅ Privacy Policy

**Required!** Create a privacy policy covering:
- What data you collect
- How you use it
- Third-party services (Firebase, Expo, etc.)
- User rights

**Free Privacy Policy Generators:**
- https://www.privacypolicygenerator.info/
- https://www.freeprivacypolicy.com/

## 🔧 Build Profiles

### Production Build (for Play Store)
```bash
eas build --platform android --profile production
```
- Optimized for release
- Signed with your keystore
- Ready for Play Store

### Preview Build (for testing)
```bash
eas build --platform android --profile preview
```
- Can install directly on device
- Good for testing before production

## 📱 Testing Before Release

### Internal Testing Track
1. Upload AAB to Internal Testing track first
2. Add testers (up to 100)
3. Test thoroughly
4. Then promote to Production

### Test Checklist
- [ ] App installs correctly
- [ ] Login/Registration works
- [ ] Products load correctly
- [ ] Cart functionality works
- [ ] Checkout process works
- [ ] Push notifications work
- [ ] Order tracking works
- [ ] All screens render correctly
- [ ] No crashes on different Android versions

## 🚨 Common Issues & Fixes

### Issue 1: Build Fails - Missing Keystore
**Fix**: EAS will auto-generate keystore on first build. Just run the build command.

### Issue 2: Version Code Already Used
**Fix**: Increment `versionCode` in `app.json`:
```json
"versionCode": 3  // Change from 2 to 3
```

### Issue 3: Package Name Already Exists
**Fix**: Change package name in `app.json`:
```json
"package": "com.yourcompany.sejasfresh"
```

### Issue 4: App Size Too Large
**Fix**: 
- Optimize images
- Remove unused assets
- Use Android App Bundle (AAB) instead of APK

### Issue 5: Privacy Policy Missing
**Fix**: Create privacy policy and add URL in Play Console → App Content → Privacy Policy

## 📊 Build Commands Reference

```bash
# Login to Expo
eas login

# Check build status
eas build:list

# Build for Android (Production)
eas build --platform android --profile production

# Build for Android (Preview/Testing)
eas build --platform android --profile preview

# Build for iOS (if needed later)
eas build --platform ios --profile production

# View build logs
eas build:view [BUILD_ID]
```

## 🎉 After Publishing

1. **Monitor Reviews**: Check Play Console for user reviews
2. **Track Crashes**: Use Firebase Crashlytics or Sentry
3. **Analytics**: Set up Google Analytics or Firebase Analytics
4. **Updates**: Use same process to release updates (increment version)

## 📞 Support

- **Expo Docs**: https://docs.expo.dev/build/introduction/
- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **Play Console Help**: https://support.google.com/googleplay/android-developer

---

## ⚡ Quick Start (TL;DR)

```bash
# 1. Login
cd MeatDeliveryUserApp
eas login

# 2. Update version in app.json
# version: "1.0.1"
# versionCode: 2

# 3. Build
eas build --platform android --profile production

# 4. Wait for build (15-30 min)

# 5. Download .aab from expo.dev

# 6. Upload to Play Console → Production → Create release

# 7. Fill store listing, screenshots, privacy policy

# 8. Submit for review

# 9. Wait for approval (1-7 days)

# 10. App goes live! 🎉
```

---

**Current App Configuration:**
- **Name**: Sejas Fresh
- **Package**: com.batman1428.MeatDeliveryUserApp
- **Version**: 1.0.1
- **Version Code**: 2
- **EAS Project ID**: 01c9f98b-2648-4a98-ae4d-b6a9dee68d1b

**Ready to build!** 🚀

