# ⚡ Quick Build for Play Store

## 🚀 Fast Track (5 Steps)

### Step 1: Install EAS CLI (if not installed)
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
cd MeatDeliveryUserApp
eas login
```
Enter your Expo account email/password (create account at https://expo.dev if needed)

### Step 3: Build for Play Store
```bash
eas build --platform android --profile production
```

### Step 4: Wait for Build (15-30 minutes)
- You'll get a URL to track progress
- Check email when complete
- Build will be available at https://expo.dev

### Step 5: Download & Upload
1. Go to https://expo.dev → Your Project → Builds
2. Download the `.aab` file
3. Upload to Google Play Console → Production → Create Release

## ✅ Pre-Build Checklist

Before building, verify in `app.json`:

- [ ] **Version**: `"version": "1.0.1"` (or higher)
- [ ] **Version Code**: `"versionCode": 2` (or higher than previous)
- [ ] **Package Name**: `"package": "com.batman1428.MeatDeliveryUserApp"`
- [ ] **App Icon**: Exists at `./assets/images/icon.png` (1024x1024px)

## 📱 Current Configuration

```json
{
  "name": "Sejas Fresh",
  "version": "1.0.1",
  "android": {
    "package": "com.batman1428.MeatDeliveryUserApp",
    "versionCode": 2
  }
}
```

## 🎯 Build Command

**Production Build (for Play Store):**
```bash
eas build --platform android --profile production
```

This will create an **Android App Bundle (.aab)** which is required for Play Store.

## 📋 After Build Completes

1. **Download .aab file** from expo.dev
2. **Go to Google Play Console**: https://play.google.com/console
3. **Create app** (if first time) or select existing
4. **Upload .aab** to Production track
5. **Fill store listing**:
   - App name: Sejas Fresh
   - Short description: Order fresh meat online with Sejas Fresh
   - Screenshots (at least 2)
   - Privacy Policy URL (required!)
6. **Submit for review**

## ⚠️ Important Notes

- **Privacy Policy**: Required! Create one before submitting
- **Version Code**: Must increment for each new build (2 → 3 → 4...)
- **Build Time**: 15-30 minutes typically
- **Keystore**: EAS auto-generates on first build (don't worry about it)

## 🆘 Need Help?

See full guide: `PLAYSTORE_BUILD_GUIDE.md`

---

**Ready to build? Run:**
```bash
eas build --platform android --profile production
```

