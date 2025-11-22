# 📱 Connect Expo App via USB

## 🚀 Quick Steps to Open App via USB

### **Step 1: Start Expo Development Server**

Open terminal in the `MeatDeliveryUserApp` folder and run:

```bash
npx expo start
```

### **Step 2: Connect Your Device via USB**

#### **For Android:**
1. **Enable USB Debugging:**
   - Go to: `Settings > About Phone`
   - Tap "Build Number" 7 times to enable Developer Options
   - Go to: `Settings > Developer Options`
   - Enable "USB Debugging"
   - Connect phone via USB

2. **Verify Connection:**
   ```bash
   adb devices
   ```
   You should see your device listed

#### **For iOS (Mac only):**
1. Connect iPhone via USB
2. Trust the computer on your iPhone when prompted
3. Make sure Xcode is installed

### **Step 3: Open App on Device**

#### **Option A: Using Expo Go (Easiest)**

1. **Install Expo Go** on your device:
   - Android: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **In Expo terminal, press:**
   - `a` - to open on Android device (via USB)
   - `i` - to open on iOS device (via USB)

3. **Or scan QR code:**
   - Open Expo Go app
   - Tap "Scan QR Code"
   - Scan the QR code shown in terminal

#### **Option B: Using Development Build (If you have one)**

1. **Start with dev client:**
   ```bash
   npx expo start --dev-client
   ```

2. **Press:**
   - `a` - for Android
   - `i` - for iOS

## 🔧 Troubleshooting

### **"adb is not recognized" Error**

This means Android SDK is not installed or not in PATH.

**Solution:**
1. Install Android Studio
2. Set ANDROID_HOME environment variable:
   ```bash
   # Windows (PowerShell)
   $env:ANDROID_HOME = "C:\Users\YourName\AppData\Local\Android\Sdk"
   
   # Or add to System Environment Variables:
   # ANDROID_HOME = C:\Users\YourName\AppData\Local\Android\Sdk
   # PATH = %ANDROID_HOME%\platform-tools
   ```

3. Restart terminal and try again

### **Device Not Detected**

**For Android:**
```bash
# Check if device is connected
adb devices

# If empty, try:
adb kill-server
adb start-server
adb devices
```

**For iOS:**
- Make sure you're on Mac
- Install Xcode from App Store
- Trust the computer on iPhone

### **App Won't Connect**

1. **Check USB connection:**
   - Try different USB cable
   - Try different USB port
   - Make sure USB debugging is enabled

2. **Use Tunnel Mode (Alternative):**
   ```bash
   npx expo start --tunnel
   ```
   This works over internet instead of USB

3. **Use LAN Mode:**
   ```bash
   npx expo start --lan
   ```
   Make sure device and computer are on same WiFi

## 📋 Quick Reference Commands

```bash
# Start Expo
npx expo start

# Start with dev client
npx expo start --dev-client

# Start with tunnel (if USB not working)
npx expo start --tunnel

# Check Android devices
adb devices

# Restart ADB
adb kill-server && adb start-server

# In Expo terminal:
# Press 'a' - Open on Android
# Press 'i' - Open on iOS
# Press 'w' - Open in web browser
# Press 'r' - Reload app
# Press 'm' - Toggle menu
```

## ✅ Success Indicators

When connected successfully, you should see:
- ✅ Device appears in `adb devices`
- ✅ Expo Go opens automatically
- ✅ App loads on your device
- ✅ Changes hot reload automatically

## 🎯 Recommended Setup

**For Development:**
1. Use USB connection for faster reload
2. Keep Expo Go installed for quick testing
3. Use development build for production-like testing

**For Testing:**
1. Use tunnel mode if USB is unreliable
2. Use LAN mode if on same WiFi network
3. Share QR code for team testing

---

**Need Help?** Check the terminal output - Expo shows helpful messages and options!

