# 🚀 Development Build Setup Guide

## Overview
This guide will help you set up and use a development build instead of Expo Go for better performance and native feature access.

## ✅ Prerequisites (Already Done)
- ✅ expo-dev-client installed
- ✅ EAS CLI installed and logged in
- ✅ eas.json configured for development builds
- ✅ app.json updated with expo-dev-client plugin

## 📱 Building Your Development Build

### For Android:
```bash
# Build development APK
eas build --platform android --profile development

# Alternative: Build locally (faster, requires Android SDK)
eas build --platform android --profile development --local
```

### For iOS (Mac required):
```bash
# Build development IPA
eas build --platform ios --profile development

# Alternative: Build locally (faster, requires Xcode)
eas build --platform ios --profile development --local
```

## 📋 Build Process Steps

1. **Start the Build**
   - Run the build command
   - EAS will compile your app with native dependencies
   - Build takes 5-15 minutes depending on complexity

2. **Download & Install**
   - Once build completes, you'll get a download link
   - Install the APK/IPA on your device
   - Enable "Install from Unknown Sources" on Android if needed

3. **Development Server**
   - Run `npx expo start --dev-client` instead of `npx expo start`
   - The development build will connect to your local server
   - Hot reload and fast refresh work normally

## 🔧 Key Differences from Expo Go

### **Development Build Advantages:**
- ✅ **Native Dependencies**: Full access to any native library
- ✅ **Better Performance**: Optimized native code
- ✅ **Custom Native Code**: Can add custom native modules
- ✅ **Push Notifications**: Work properly on physical devices
- ✅ **Production-like Environment**: Closer to final app behavior
- ✅ **Debugging**: Better debugging capabilities

### **Expo Go Limitations (that we're now avoiding):**
- ❌ Limited to Expo SDK modules only
- ❌ Performance overhead
- ❌ Push notifications don't work properly
- ❌ Can't use custom native dependencies
- ❌ Simulator-only for some features

## 🛠 Development Workflow

### **Daily Development:**
```bash
# Start development server
npx expo start --dev-client

# Your development build app will show available servers
# Select your local development server
# Code changes will hot reload automatically
```

### **When to Rebuild:**
- ✅ Added new native dependencies
- ✅ Changed app.json configuration
- ✅ Modified native code
- ✅ Updated Expo SDK version

### **No Rebuild Needed:**
- ✅ JavaScript/TypeScript code changes
- ✅ Component updates
- ✅ Style changes
- ✅ Adding new screens/navigation

## 📊 Build Profiles Explained

### **development** (Current)
```json
{
  "developmentClient": true,
  "distribution": "internal",
  "android": {
    "buildType": "apk"
  }
}
```
- For daily development
- Includes dev tools and debugging
- Larger file size
- Internal distribution only

### **preview**
```json
{
  "distribution": "internal",
  "android": {
    "buildType": "apk"
  }
}
```
- For testing and sharing
- Production-like but not optimized
- Good for stakeholder reviews

### **production**
```json
{
  "android": {
    "buildType": "app-bundle"
  }
}
```
- For app store submission
- Fully optimized
- Smallest file size

## 🔍 Troubleshooting

### **Common Issues:**

1. **Build Fails**
   - Check native dependencies compatibility
   - Verify app.json configuration
   - Check EAS build logs for specific errors

2. **App Won't Connect to Dev Server**
   - Ensure both device and computer are on same WiFi
   - Check firewall settings
   - Try using `--tunnel` flag: `npx expo start --dev-client --tunnel`

3. **Push Notifications Not Working**
   - Ensure you're testing on a physical device
   - Check notification permissions in device settings
   - Verify Expo notification service configuration

### **Debug Commands:**
```bash
# View build logs
eas build:list

# Check build status
eas build:view [build-id]

# Clear build cache if needed
eas build --platform android --profile development --clear-cache
```

## 🎯 Next Steps

1. **Build Your Development App**
   - Run the build command below
   - Wait for completion (5-15 minutes)
   - Download and install on your device

2. **Update Development Workflow**
   - Use `npx expo start --dev-client` instead of regular start
   - Your custom development build will connect automatically

3. **Test Native Features**
   - Push notifications will work properly
   - Better performance overall
   - Full access to native device features

## 🔧 Commands to Run

Ready to build? Run this command:

```bash
# For Android (recommended to start with)
eas build --platform android --profile development

# After installation, use this to start development:
npx expo start --dev-client
```

Your development build will be much more capable than Expo Go and provide a better development experience!