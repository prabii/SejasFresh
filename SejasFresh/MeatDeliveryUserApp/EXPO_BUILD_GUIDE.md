# 📱 Expo Build Guide - Sejas Fresh App

Complete guide to building your Expo app for development and production.

## 🚀 Quick Start

### **Option 1: Development Build (Recommended for Testing)**

#### **For Android:**
```bash
cd MeatDeliveryUserApp
npx expo run:android
```

#### **For iOS (Mac only):**
```bash
cd MeatDeliveryUserApp
npx expo run:ios
```

### **Option 2: EAS Build (Cloud Build - Recommended for Production)**

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Build for both
eas build --platform all
```

---

## 📋 Detailed Build Methods

### **1. Development Build (Local)**

Best for: Testing during development

#### **Prerequisites:**
- **Android:** Android Studio installed, Android SDK configured
- **iOS:** Xcode installed (Mac only), CocoaPods installed

#### **Build Commands:**

**Android:**
```bash
cd MeatDeliveryUserApp
npm install
npx expo run:android
```

**iOS:**
```bash
cd MeatDeliveryUserApp
npm install
npx expo run:ios
```

**What happens:**
- Creates a development build on your machine
- Installs on connected device/emulator
- Includes dev tools and hot reload

---

### **2. EAS Build (Cloud Build)**

Best for: Production builds, sharing with testers, App Store/Play Store

#### **Setup EAS:**

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```
   (Create account at [expo.dev](https://expo.dev) if needed)

3. **Configure Build:**
   ```bash
   cd MeatDeliveryUserApp
   eas build:configure
   ```

#### **Build Types:**

**Development Build:**
```bash
# Android
eas build --profile development --platform android

# iOS
eas build --profile development --platform ios
```

**Preview Build (for testing):**
```bash
# Android APK
eas build --profile preview --platform android

# iOS (requires Apple Developer account)
eas build --profile preview --platform ios
```

**Production Build:**
```bash
# Android AAB (for Play Store)
eas build --profile production --platform android

# iOS (for App Store)
eas build --profile production --platform ios
```

---

### **3. Using Expo Go (Quick Testing)**

Best for: Quick testing without native modules

**Note:** Your app uses `expo-location` and `expo-notifications` which require a development build, not Expo Go.

**For basic testing:**
```bash
cd MeatDeliveryUserApp
npx expo start
# Scan QR code with Expo Go app
```

---

## ⚙️ EAS Build Configuration

Your `eas.json` file controls build settings. Here's what you can configure:

### **Build Profiles:**

1. **development** - Development builds with dev tools
2. **preview** - Testing builds (APK for Android, IPA for iOS)
3. **production** - Store-ready builds (AAB for Android, IPA for iOS)

### **Example eas.json:**

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "bundleIdentifier": "com.sejasfresh.MeatDeliveryUserApp"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 📦 Build Outputs

### **Android:**
- **APK** - Direct install file (preview builds)
- **AAB** - App Bundle for Play Store (production builds)

### **iOS:**
- **IPA** - iOS app file (requires Apple Developer account)

---

## 🔐 Signing & Credentials

### **Android:**
- EAS automatically manages signing keys
- Or use your own keystore

### **iOS:**
- Requires Apple Developer account ($99/year)
- EAS can manage certificates automatically
- Or provide your own certificates

**Setup iOS credentials:**
```bash
eas credentials
```

---

## 🚀 Step-by-Step: First Production Build

### **1. Install EAS CLI:**
```bash
npm install -g eas-cli
```

### **2. Login:**
```bash
eas login
```

### **3. Configure Project:**
```bash
cd MeatDeliveryUserApp
eas build:configure
```

### **4. Build for Android (APK for testing):**
```bash
eas build --profile preview --platform android
```

### **5. Download & Install:**
- Build will be available at [expo.dev](https://expo.dev)
- Download APK and install on Android device
- Or use the download link provided

### **6. Build for Production:**
```bash
# Android AAB for Play Store
eas build --profile production --platform android

# iOS for App Store (requires Apple Developer account)
eas build --profile production --platform ios
```

---

## 📱 Testing Your Build

### **Development Build:**
1. Build completes
2. Install on device via USB or download link
3. App opens with dev tools
4. Connect to Metro bundler for hot reload

### **Preview/Production Build:**
1. Download APK/AAB/IPA
2. Install on device
3. Test all features
4. Submit to stores if production build

---

## 🔧 Troubleshooting

### **Build Fails:**
```bash
# Check build logs
eas build:list
eas build:view [build-id]

# Clear cache and rebuild
eas build --clear-cache --platform android
```

### **Android Build Issues:**
- Ensure `app.json` has correct package name
- Check Android permissions are correct
- Verify `versionCode` is incremented

### **iOS Build Issues:**
- Ensure Apple Developer account is active
- Check bundle identifier matches
- Verify certificates are valid

---

## 📝 Important Notes

1. **Your app uses native modules:**
   - `expo-location` - Requires development build
   - `expo-notifications` - Requires development build
   - Cannot use Expo Go for full testing

2. **API Configuration:**
   - Update `app.json` → `extra.apiHost` for production
   - Currently set to: `sejasfresh.cloud`

3. **Version Management:**
   - Update `version` in `app.json` for each release
   - Android: Update `versionCode`
   - iOS: Update `buildNumber`

---

## 🎯 Recommended Workflow

1. **Development:**
   ```bash
   npx expo run:android  # or run:ios
   ```

2. **Testing:**
   ```bash
   eas build --profile preview --platform android
   ```

3. **Production:**
   ```bash
   eas build --profile production --platform all
   ```

---

## 📚 Resources

- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Expo Build Guide](https://docs.expo.dev/build/setup/)
- [App Signing Guide](https://docs.expo.dev/app-signing/app-credentials/)

---

**Ready to build?** Start with:
```bash
cd MeatDeliveryUserApp
eas build:configure
eas build --profile preview --platform android
```

