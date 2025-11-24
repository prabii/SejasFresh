# 🔍 How to Find Upload Key Certificate Section

## 🎯 Alternative Locations

Since you don't see "Upload key certificate" section, try these locations:

### Option 1: Go to App Signing Page Directly

**Navigation Path:**
```
Play Console → Your App → Release → Setup → App Signing
```

**OR:**

```
Play Console → Your App → Setup → App Signing
```

**Look for:**
- Section: **"Upload key certificate"**
- Should show current certificate or "Add upload key" button

### Option 2: Click "Change signing key" Link

From the page you're on (Create internal testing release):

1. **Click "Change signing key"** link (in App integrity section)
2. **Select**: "Export and upload a key (not using Java Keystore)"
3. **OR**: Look for option to **"Register upload key"** or **"Add upload key"**

### Option 3: Go to Setup → App Signing

**Direct Navigation:**
1. In Play Console sidebar, click **"Setup"**
2. Click **"App Signing"**
3. Look for **"Upload key certificate"** section

### Option 4: Upload Bundle First (Auto-Registration)

Sometimes Play Console registers the upload key automatically:

1. **Upload your AAB file** (even if it shows error)
2. **Click on the error message**
3. **Look for**: "Register upload key" or "Add upload certificate" option
4. **Enter SHA-1**: `FB:0D:51:5D:BC:79:2A:2D:C3:7B:46:64:23:9A:90:DA:A6:46:6C:EA`

## 🔍 What to Look For

In **App Signing** page, you should see:

1. **App signing key** (managed by Google) ✅
2. **Upload key certificate** (this is what you need) ❓
3. **Options to add/register upload key**

## 📋 Step-by-Step: Try This First

### Step 1: Navigate to App Signing

```
Play Console → Your App → Setup → App Signing
```

### Step 2: Look for These Sections

- **"App signing key"** - Shows Google-managed key
- **"Upload key certificate"** - Should be below app signing key
- **"Key upgrade"** - If available

### Step 3: If Still Not Visible

**Try uploading the bundle anyway:**

1. Go back to: **Create internal testing release**
2. **Upload your AAB file**
3. **When error appears**, click on it
4. **Look for**: "Register upload certificate" or "Add upload key" link in error message

## 🎯 Alternative: Use "Change signing key" Flow

If you see "Change signing key" link:

1. **Click "Change signing key"**
2. **Select**: "Export and upload a key (not using Java Keystore)"
3. **Follow instructions** to register your upload certificate
4. **Enter SHA-1**: `FB:0D:51:5D:BC:79:2A:2D:C3:7B:46:64:23:9A:90:DA:A6:46:6C:EA`

## ⚡ Quick Test

**Try this:**

1. **Upload your AAB file** to the "App bundles" section
2. **When error appears**, click on the error message
3. **Look for**: "Register upload key" or "Add certificate" option in error details
4. **Click it** and enter the SHA-1 fingerprint

Sometimes Play Console shows the registration option only after you try to upload!

---

**Your Upload Certificate SHA-1:**
```
FB:0D:51:5D:BC:79:2A:2D:C3:7B:46:64:23:9A:90:DA:A6:46:6C:EA
```

**Try uploading the bundle first - the error message might have a "Register" button!**

