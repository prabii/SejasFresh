# 🔑 Upload Certificate Fix - Google Play App Signing

## 🚨 Problem

Google Play Console expects upload certificate fingerprint:
```
SHA1: 04:4C:D8:49:F1:D8:5D:19:58:05:48:A5:A5:96:D9:64:6F:A3:B1:7F
```

But your new build has:
```
SHA1: FB:0D:51:5D:BC:79:2A:2D:C3:7B:46:64:23:9A:90:DA:A6:46:6C:EA
```

## ✅ Solution: Upload New Certificate to Play Console

Since Google Play App Signing is enabled, you need to register your new upload certificate.

### Step 1: Get Upload Certificate from EAS

```bash
cd MeatDeliveryUserApp
eas credentials
```

Select:
- Platform: **Android**
- Profile: **Production**
- Action: **View credentials** or **Download credentials**

This will show/download your upload certificate.

### Step 2: Upload Certificate to Play Console

1. **Go to Google Play Console**:
   - Your App → Release → Setup → App Signing

2. **Find "Upload key certificate" section**

3. **Click "Add upload key"** or **"Upload certificate"**

4. **Upload the certificate** from EAS (or paste the SHA-1 fingerprint)

5. **Save**

### Step 3: Alternative - Get Certificate from Build

If you can't get it from EAS, extract from your `.aab` file:

```bash
# Extract certificate from AAB
jarsigner -verify -verbose -certs application-764d457e-b83e-413c-9da0-91ed70660bab.aab | grep "SHA1:"
```

Or use this online tool: https://www.keystore-explorer.org/

### Step 4: Register Upload Certificate

**In Play Console → App Signing:**

1. Look for **"Upload key certificate"** section
2. Click **"Add upload key"** or **"Register upload key"**
3. Enter the SHA-1 fingerprint: `FB:0D:51:5D:BC:79:2A:2D:C3:7B:46:64:23:9A:90:DA:A6:46:6C:EA`
4. Or upload the certificate file
5. Save

### Step 5: Re-upload Your AAB

After registering the upload certificate:
1. Upload your `.aab` file again
2. It should now be accepted!

## 🎯 Quick Fix Steps

### Option A: Register Upload Certificate (Recommended)

1. **In Play Console** → App Signing → Upload key certificate
2. **Click "Add upload key"**
3. **Enter SHA-1**: `FB:0D:51:5D:BC:79:2A:2D:C3:7B:46:64:23:9A:90:DA:A6:46:6C:EA`
4. **Save**
5. **Re-upload your AAB**

### Option B: Use Expected Upload Key

If you have the keystore matching `04:4C:D8:49:F1:D8:5D:19:58:05:48:A5:A5:96:D9:64:6F:A3:B1:7F`:

```bash
cd MeatDeliveryUserApp
eas credentials --platform android
```

Select Production → Update credentials → Upload your keystore file

## 📋 What's Happening

With **Google Play App Signing**:
- **App Signing Key**: Managed by Google (for end users)
- **Upload Key**: You use this to sign uploads (can be different)
- **Upload Certificate**: Must be registered in Play Console

Your new build uses a new upload key, so you need to register it in Play Console.

## 🔍 Find Upload Certificate in Play Console

**Play Console → App Signing → Upload key certificate**

You should see:
- Current upload certificate (if any)
- Option to "Add upload key" or "Register upload key"

## ⚡ Fastest Solution

1. **Go to Play Console** → App Signing
2. **Find "Upload key certificate"** section
3. **Click "Add upload key"** or **"Register upload key"**
4. **Enter SHA-1**: `FB:0D:51:5D:BC:79:2A:2D:C3:7B:46:64:23:9A:90:DA:A6:46:6C:EA`
5. **Save**
6. **Re-upload your AAB file**

That's it! After registering, your AAB will be accepted.

---

**Your New Upload Certificate SHA-1:**
```
FB:0D:51:5D:BC:79:2A:2D:C3:7B:46:64:23:9A:90:DA:A6:46:6C:EA
```

**Register this in Play Console → App Signing → Upload key certificate**

