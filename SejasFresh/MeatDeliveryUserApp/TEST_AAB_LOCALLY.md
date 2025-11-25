# 🧪 How to Test AAB Build Locally

AAB (Android App Bundle) files **cannot be installed directly** on Android devices. Here are 3 ways to test your build locally:

---

## ✅ **Option 1: Build Preview APK (Easiest - Recommended)**

Build an APK file that can be installed directly on your device:

### Step 1: Build Preview APK
```bash
cd MeatDeliveryUserApp
eas build --platform android --profile preview
```

This creates an **APK file** (not AAB) that you can install directly.

### Step 2: Download APK
1. Go to https://expo.dev
2. Navigate to your project → Builds
3. Download the `.apk` file

### Step 3: Install on Device
```bash
# Via ADB (if device connected via USB)
adb install path/to/your-app.apk

# Or transfer to device and install manually:
# - Email the APK to yourself
# - Use Google Drive/Dropbox
# - Transfer via USB and tap to install
```

**Note:** You may need to enable "Install from Unknown Sources" in Android settings.

---

## ✅ **Option 2: Convert AAB to APK using Bundletool**

If you already have an AAB file, convert it to APK:

### Step 1: Download Bundletool
```bash
# Download from: https://github.com/google/bundletool/releases
# Save as: bundletool.jar
```

### Step 2: Generate APK from AAB
```bash
# Generate APK set
java -jar bundletool.jar build-apks \
  --bundle=your-app.aab \
  --output=my_app.apks \
  --mode=universal

# Extract APK from APK set
unzip my_app.apks -d output_folder

# Or use this command to get universal APK directly:
java -jar bundletool.jar build-apks \
  --bundle=your-app.aab \
  --output=my_app.apks \
  --mode=universal \
  --ks=your-keystore.jks \
  --ks-pass=pass:your-keystore-password \
  --ks-key-alias=your-key-alias \
  --key-pass=pass:your-key-password
```

### Step 3: Install APK
```bash
adb install output_folder/universal.apk
```

**Note:** You'll need your keystore file and password for this method.

---

## ✅ **Option 3: Use Google Play Internal Testing**

Test the AAB through Google Play Console:

### Step 1: Upload AAB to Internal Testing
1. Go to Google Play Console
2. Select your app
3. Go to **Testing → Internal Testing**
4. Click **Create new release**
5. Upload your `.aab` file
6. Add testers (your email or test accounts)

### Step 2: Install via Play Store
1. Testers will receive an email
2. They can install from Play Store (Internal Testing link)
3. App will appear in Play Store for testers only

**Note:** This requires a Google Play Developer account ($25 one-time fee).

---

## 🚀 **Quick Comparison**

| Method | Speed | Difficulty | Best For |
|--------|-------|------------|----------|
| **Preview APK** | ⚡ Fast | ⭐ Easy | Quick local testing |
| **Bundletool** | 🐌 Slow | ⭐⭐⭐ Hard | Testing exact AAB build |
| **Internal Testing** | 🐌 Slow | ⭐⭐ Medium | Testing Play Store flow |

---

## 📱 **Recommended Workflow**

### For Development/Testing:
```bash
# Build APK for quick testing
eas build --platform android --profile preview
```

### For Production:
```bash
# Build AAB for Play Store
eas build --platform android --profile production

# Then test via:
# 1. Internal Testing track (recommended)
# 2. Or convert to APK with bundletool
```

---

## 🔧 **Install APK on Device**

### Method 1: ADB (USB Connection)
```bash
# Enable USB Debugging on your Android device
# Settings → Developer Options → USB Debugging

# Connect device via USB
adb devices  # Verify device is connected

# Install APK
adb install path/to/app.apk
```

### Method 2: Manual Install
1. Transfer APK to device (email, Drive, USB)
2. Open file manager on device
3. Tap the APK file
4. Allow "Install from Unknown Sources" if prompted
5. Tap Install

### Method 3: Wireless ADB (Android 11+)
```bash
# On device: Settings → Developer Options → Wireless debugging
# Pair device with pairing code

# On computer:
adb connect <device-ip>:<port>
adb install app.apk
```

---

## ⚠️ **Important Notes**

1. **Preview APK vs Production AAB:**
   - Preview APK: Good for testing functionality
   - Production AAB: Exact build that will be on Play Store

2. **Signing:**
   - Preview builds are signed with Expo's key
   - Production builds use your keystore
   - They may behave slightly differently

3. **Testing Checklist:**
   - [ ] App installs successfully
   - [ ] Login/Registration works
   - [ ] All screens load correctly
   - [ ] Push notifications work
   - [ ] Payment flow works (if applicable)
   - [ ] No crashes on different Android versions

---

## 🐛 **Troubleshooting**

### "App not installed" Error
- **Solution:** Uninstall previous version first
- Or: Build with higher `versionCode` in `app.json`

### "Install blocked" Error
- **Solution:** Enable "Install from Unknown Sources" in Android settings

### ADB "device not found"
- **Solution:** 
  - Enable USB Debugging
  - Install device drivers
  - Try different USB cable/port

### Bundletool "keystore not found"
- **Solution:** You need the keystore file from EAS
  - Download from: https://expo.dev → Project → Credentials → Android Keystore

---

## 📚 **Useful Commands**

```bash
# List all builds
eas build:list

# View build details
eas build:view [BUILD_ID]

# Download build
eas build:download [BUILD_ID]

# Check device connection
adb devices

# Install APK
adb install app.apk

# Uninstall app
adb uninstall com.sejasfresh.app

# View app logs
adb logcat | grep "ReactNative"
```

---

## 🎯 **Recommended Approach**

**For Quick Testing:**
```bash
eas build --platform android --profile preview
```
→ Download APK → Install on device → Test

**For Production Testing:**
1. Build AAB: `eas build --platform android --profile production`
2. Upload to Play Console → Internal Testing
3. Test via Play Store link

---

**Current Build Profiles:**
- ✅ **preview**: Builds APK (installable)
- ✅ **production**: Builds AAB (Play Store only)

**Ready to test!** 🚀

