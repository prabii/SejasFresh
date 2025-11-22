# 📱 Building the App for Testing on Your Phone

This guide will help you build and install the Meat Delivery app on your Android phone for testing.

## Prerequisites

1. **Expo Account** (free) - Sign up at https://expo.dev
2. **Android Phone** with USB debugging enabled
3. **USB Cable** to connect your phone to your computer

## Method 1: Development Build (Recommended for Testing)

This creates a custom development build that includes all native modules.

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
eas login
```

### Step 3: Configure EAS Build

```bash
cd MeatDeliveryUserApp
eas build:configure
```

This will create an `eas.json` file. You can use the default configuration.

### Step 4: Build APK for Android

```bash
eas build --platform android --profile development
```

This will:
- Upload your code to Expo's servers
- Build the APK
- Provide a download link

### Step 5: Install on Your Phone

1. Download the APK from the link provided
2. Transfer it to your phone (via USB, email, or cloud storage)
3. On your phone, enable "Install from Unknown Sources" in Settings
4. Open the APK file and install

## Method 2: Quick Build with Expo Go (Limited Features)

**Note:** This method has limitations - push notifications won't work fully in Expo Go.

### Step 1: Start Development Server

```bash
cd MeatDeliveryUserApp
npx expo start
```

### Step 2: Install Expo Go

1. Download "Expo Go" from Google Play Store on your phone
2. Scan the QR code shown in your terminal/browser
3. The app will load in Expo Go

## Method 3: Local APK Build (Advanced)

If you have Android Studio installed:

### Step 1: Generate Android Project

```bash
cd MeatDeliveryUserApp
npx expo prebuild --platform android
```

### Step 2: Build APK with Gradle

```bash
cd android
./gradlew assembleDebug
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 3: Install on Phone

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

Or manually transfer and install the APK file.

## Method 4: Using Expo Development Build (Best for Full Features)

### Step 1: Create Development Build

```bash
cd MeatDeliveryUserApp
npx expo install expo-dev-client
npx expo run:android
```

This will:
- Build the app locally
- Install it on your connected Android device
- Start the development server

### Step 2: Connect Your Phone

1. Enable USB debugging on your phone:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings > Developer Options
   - Enable "USB Debugging"

2. Connect phone via USB

3. Run the build command above

## Troubleshooting

### "adb not found" Error

Install Android SDK Platform Tools:
- Download from: https://developer.android.com/studio/releases/platform-tools
- Add to PATH environment variable

### Build Fails

1. Clear cache:
   ```bash
   npx expo start -c
   ```

2. Clear node_modules:
   ```bash
   rm -rf node_modules
   npm install
   ```

### App Crashes on Launch

1. Check logs:
   ```bash
   npx expo start
   ```

2. Check device logs:
   ```bash
   adb logcat
   ```

## Configuration Files

Make sure these are set correctly:

### `app.json` - API Configuration

```json
{
  "extra": {
    "apiHost": "YOUR_IP_ADDRESS"  // Your computer's local IP for development
  }
}
```

To find your IP:
- Windows: `ipconfig` (look for IPv4 Address)
- Mac/Linux: `ifconfig` or `ip addr`

### Environment Variables

Create a `.env` file (optional):
```
API_URL=http://YOUR_IP:5000/api
```

## Testing Checklist

- [ ] App installs successfully
- [ ] Login/Signup works
- [ ] Products load from backend
- [ ] Cart functionality works
- [ ] Orders can be placed
- [ ] Notifications work (if using development build)
- [ ] Location services work

## Next Steps

After building:
1. Test all features
2. Report any bugs
3. For production build, use:
   ```bash
   eas build --platform android --profile production
   ```

## Need Help?

- Expo Docs: https://docs.expo.dev
- EAS Build Docs: https://docs.expo.dev/build/introduction/
- Expo Discord: https://chat.expo.dev

