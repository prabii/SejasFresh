# 🔑 Fix: Wrong Signing Key Error

## 🚨 Problem

Your app bundle is signed with a different key than what Google Play Console expects.

**Expected Key (Play Console):**
```
SHA1: DA:33:00:F2:43:51:20:E0:89:07:1E:D3:CE:68:9B:43:C7:27:FC:B5
```

**Your Current Key:**
```
SHA1: 04:4C:D8:49:F1:D8:5D:19:5B:05:48:A5:A5:96:D9:64:6F:A3:B1:7F
```

## ✅ Solutions

### Solution 1: Use Existing Keystore (If You Have It)

If you have the original keystore file that matches the expected fingerprint:

1. **Configure EAS to use your keystore:**

```bash
cd MeatDeliveryUserApp
eas credentials
```

2. Select:
   - **Platform**: Android
   - **Workflow**: Production
   - **Action**: Update credentials
   - **Keystore**: Upload your existing `.jks` or `.keystore` file

3. **Rebuild:**
```bash
eas build --platform android --profile production
```

### Solution 2: Use Google Play App Signing (Recommended)

**If you don't have the original keystore**, use Google Play App Signing:

1. **Go to Google Play Console**:
   - Your App → Release → Setup → App Signing

2. **Enable Google Play App Signing**:
   - Google will manage your signing key
   - You upload with an upload key (can be different)

3. **Get Upload Key Certificate**:
   - Play Console will show you the upload certificate fingerprint
   - This is what you need to match

4. **Configure EAS with Upload Key**:
   ```bash
   eas credentials
   ```
   - Select Android → Production
   - Choose "Generate new keystore" or upload upload key
   - EAS will use this as upload key

5. **Rebuild and Upload**:
   ```bash
   eas build --platform android --profile production
   ```

### Solution 3: Reset App Signing Key (Last Resort)

**⚠️ Warning**: This requires contacting Google Support and may take time.

1. **Go to Play Console**:
   - App → Release → Setup → App Signing

2. **Request Key Reset**:
   - Click "Request key reset"
   - Explain why you need it (lost keystore, etc.)
   - Google will review (can take days)

3. **After Approval**:
   - Google will reset the signing key
   - You can then upload with new key

### Solution 4: Create New App Listing (If App Not Published)

**If your app hasn't been published yet** (no users):

1. **Delete current app** in Play Console
2. **Create new app** with new package name
3. **Update `app.json`**:
   ```json
   {
     "android": {
       "package": "com.batman1428.sejasfresh"  // Change package name
     }
   }
   ```
4. **Rebuild**:
   ```bash
   eas build --platform android --profile production
   ```

## 🔍 Find Your Keystore

### Check EAS Credentials

```bash
cd MeatDeliveryUserApp
eas credentials
```

This will show:
- Current keystore information
- Option to download keystore
- Option to update credentials

### Download Keystore from EAS

If EAS has your keystore:

```bash
eas credentials
```

Select:
- Android → Production
- Download keystore

**Save it securely!** You'll need it for all future updates.

## 📋 Step-by-Step: Use Google Play App Signing

### Step 1: Enable App Signing in Play Console

1. Go to: **Play Console → Your App → Release → Setup → App Signing**
2. Click **"Enable Google Play App Signing"**
3. Follow the setup wizard
4. **Note the Upload Certificate fingerprint** (this is what you need to match)

### Step 2: Configure EAS with Upload Key

```bash
cd MeatDeliveryUserApp
eas credentials
```

**Select:**
- Platform: **Android**
- Workflow: **Production**
- Action: **Update credentials**

**Options:**
- **Option A**: If you have upload key → Upload it
- **Option B**: Generate new upload key → EAS will create one

### Step 3: Verify Upload Certificate

After configuring, check the certificate fingerprint:

```bash
eas credentials
```

Select Android → Production → View credentials

The fingerprint should match what Play Console expects for **upload certificate** (not app signing certificate).

### Step 4: Rebuild

```bash
eas build --platform android --profile production
```

### Step 5: Upload to Play Console

1. Download the new `.aab` file
2. Upload to Play Console
3. Play Console will re-sign with app signing key automatically

## 🎯 Recommended Approach

**For new apps or if you lost the keystore:**

1. **Enable Google Play App Signing** (let Google manage the key)
2. **Use EAS to generate upload key** (easier to manage)
3. **Upload builds** - Google will handle signing

**For existing apps with keystore:**

1. **Use your existing keystore** with EAS
2. **Configure EAS credentials** to use your keystore
3. **Rebuild** with correct key

## 🔐 Keystore Management Best Practices

1. **Backup your keystore**:
   - Download from EAS: `eas credentials`
   - Store in secure location (password manager, encrypted drive)
   - **Never commit to Git!**

2. **Use Google Play App Signing**:
   - Google manages app signing key
   - You only need upload key
   - Easier to recover if upload key is lost

3. **Document keystore info**:
   - Store alias, password, location securely
   - Share with team securely (if needed)

## 🆘 Still Having Issues?

### Check Current EAS Credentials

```bash
eas credentials
```

This will show:
- Current keystore status
- Certificate fingerprints
- Options to update

### Contact Support

- **Expo Support**: https://expo.dev/support
- **Google Play Support**: https://support.google.com/googleplay/android-developer

---

## ⚡ Quick Fix (If You Have Original Keystore)

```bash
cd MeatDeliveryUserApp

# Configure credentials
eas credentials

# Select: Android → Production → Update credentials
# Upload your original .jks or .keystore file

# Rebuild
eas build --platform android --profile production
```

---

**Next Steps:**
1. Check if you have the original keystore
2. If yes → Configure EAS to use it
3. If no → Enable Google Play App Signing
4. Rebuild and upload

