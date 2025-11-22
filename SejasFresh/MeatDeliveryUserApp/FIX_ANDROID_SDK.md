# 🔧 Fix Android SDK / ADB Error

## ❌ Error You're Seeing:
```
Failed to resolve the Android SDK path
'adb' is not recognized as an internal or external command
```

## ✅ Solution Options

### **Option 1: Install Android Studio (Recommended)**

1. **Download & Install Android Studio:**
   - Go to: https://developer.android.com/studio
   - Download and install Android Studio
   - During installation, make sure "Android SDK" is selected

2. **Find SDK Location:**
   - Open Android Studio
   - Go to: `File > Settings > Appearance & Behavior > System Settings > Android SDK`
   - Copy the "Android SDK Location" path (usually: `C:\Users\YourName\AppData\Local\Android\Sdk`)

3. **Set Environment Variables (Windows):**
   
   **Method A: Via System Settings:**
   - Press `Win + R`, type `sysdm.cpl`, press Enter
   - Go to "Advanced" tab → "Environment Variables"
   - Click "New" under "User variables":
     - Variable name: `ANDROID_HOME`
     - Variable value: `C:\Users\codep\AppData\Local\Android\Sdk` (or your SDK path)
   - Find "Path" in User variables → Edit → Add:
     - `%ANDROID_HOME%\platform-tools`
     - `%ANDROID_HOME%\tools`
   - Click OK on all dialogs
   - **Restart your terminal/VS Code**

   **Method B: Via PowerShell (Temporary - for current session):**
   ```powershell
   $env:ANDROID_HOME = "C:\Users\codep\AppData\Local\Android\Sdk"
   $env:PATH += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools"
   ```

4. **Verify Installation:**
   ```bash
   adb version
   ```
   Should show ADB version if working

### **Option 2: Use Tunnel Mode (No SDK Needed!)**

If you don't want to install Android Studio, use tunnel mode:

```bash
cd MeatDeliveryUserApp
npx expo start --tunnel
```

Then:
1. Open Expo Go app on your phone
2. Scan the QR code shown in terminal
3. Works over internet - no USB/ADB needed!

### **Option 3: Use LAN Mode (Same WiFi)**

If your phone and computer are on same WiFi:

```bash
cd MeatDeliveryUserApp
npx expo start --lan
```

Then scan QR code with Expo Go.

## 🚀 Quick Fix (Recommended for Now)

**Just use tunnel mode - no setup needed:**

```bash
cd MeatDeliveryUserApp
npx expo start --tunnel
```

This works immediately without installing anything!

## ✅ After Setting ANDROID_HOME

1. **Close and reopen your terminal/VS Code**
2. **Verify:**
   ```bash
   adb devices
   ```
3. **Start Expo:**
   ```bash
   cd MeatDeliveryUserApp
   npx expo start
   ```
4. **Press `a` to open on Android**

## 📝 Check Your Current SDK Path

Run this to see if SDK exists:
```powershell
Test-Path "C:\Users\codep\AppData\Local\Android\Sdk"
```

If it returns `False`, Android SDK is not installed at that location.

## 🎯 Recommended: Use Tunnel Mode

For now, the easiest solution is:
```bash
npx expo start --tunnel
```

No Android SDK setup needed! Just scan QR code with Expo Go.

