# 🚀 Quick Build Guide for Android Phone Testing

## Fastest Method: Development Build (Recommended)

### Step 1: Install EAS CLI (One-time setup)

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
eas login
```

### Step 3: Build APK

```bash
cd MeatDeliveryUserApp
eas build --platform android --profile development
```

This will:
- ✅ Build a development APK with all features
- ✅ Provide a download link
- ✅ Take about 10-15 minutes

### Step 4: Install on Phone

1. Download the APK from the link
2. Transfer to your phone
3. Enable "Install from Unknown Sources" in Settings
4. Open and install the APK

---

## Alternative: Local Build (Faster, but requires Android Studio)

### Prerequisites
- Android Studio installed
- Android SDK configured
- Phone connected via USB with USB debugging enabled

### Build Command

```bash
cd MeatDeliveryUserApp
npx expo run:android
```

This will:
- ✅ Build locally
- ✅ Install directly on connected phone
- ✅ Start development server

---

## Troubleshooting

### Error: "useAuth must be used within an AuthProvider"
✅ **FIXED** - Provider order has been corrected

### Error: "expo-notifications not supported in Expo Go"
⚠️ **Expected** - Use development build instead of Expo Go for full features

### Build fails?
```bash
# Clear cache
npx expo start -c

# Reinstall dependencies
rm -rf node_modules
npm install
```

---

## What's Fixed

✅ Provider order corrected (AuthProvider now wraps NotificationProvider)
✅ NotificationContext handles missing auth gracefully
✅ All features will work in development build

---

## Next Steps After Build

1. Test login/signup
2. Test product browsing
3. Test cart and checkout
4. Test order placement
5. Test notifications (in development build)

---

**Need help?** Check `BUILD_INSTRUCTIONS.md` for detailed steps.

