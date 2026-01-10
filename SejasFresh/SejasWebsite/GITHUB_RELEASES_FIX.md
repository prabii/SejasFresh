# 🔧 Fix GitHub Releases Direct Download

## Issue: Download Button Redirects Instead of Downloading

If clicking the download button redirects to the GitHub releases page instead of downloading, the tag name in the URL might be incorrect.

## ✅ How to Get the Correct Download URL

### Step 1: Get the Exact Tag Name

1. Go to: https://github.com/prabii/SejasFresh/releases
2. Click on your release (the one with "SejasAPP")
3. Look at the URL - it will show: `.../releases/tag/TAG_NAME`
4. **Copy the exact tag name** (it might be "Sejas", "SejasAPP", or something else)

### Step 2: Get the Exact Filename

1. On the release page, look at the "Assets" section
2. Find your APK file
3. **Copy the exact filename** (including any dots, dashes, or special characters)
4. Current filename: `Sejas.Fresh.apk`

### Step 3: Construct the Direct Download URL

The format is:
```
https://github.com/prabii/SejasFresh/releases/download/TAG_NAME/FILENAME
```

**Example:**
- If tag is `Sejas` and file is `Sejas.Fresh.apk`:
  ```
  https://github.com/prabii/SejasFresh/releases/download/Sejas/Sejas.Fresh.apk
  ```

- If tag is `SejasAPP` and file is `Sejas.Fresh.apk`:
  ```
  https://github.com/prabii/SejasFresh/releases/download/SejasAPP/Sejas.Fresh.apk
  ```

### Step 4: Test the URL

1. Copy the URL you constructed
2. Paste it directly in your browser
3. It should **download the file immediately** (not redirect)
4. If it redirects, the tag name is wrong

### Step 5: Update the Code

Edit `src/App.tsx` line 7:
```typescript
const APK_DOWNLOAD_URL = 'https://github.com/prabii/SejasFresh/releases/download/YOUR_TAG_NAME/Sejas.Fresh.apk'
```

Replace `YOUR_TAG_NAME` with the exact tag from Step 1.

## 🔍 Quick Check: Find Tag Name

**Method 1: From Release Page**
- URL shows: `.../releases/tag/Sejas` → Tag is `Sejas`
- URL shows: `.../releases/tag/SejasAPP` → Tag is `SejasAPP`

**Method 2: Right-Click APK File**
1. Go to release page
2. Right-click on `Sejas.Fresh.apk`
3. Select "Copy link address"
4. The URL will show the correct tag name

## ⚠️ Common Issues

1. **Tag name mismatch**: Release name ≠ Tag name
   - Release name: "SejasAPP" 
   - Tag name might be: "Sejas", "v1.0.0", or something else

2. **Filename mismatch**: Check exact filename
   - Case sensitive: `Sejas.Fresh.apk` ≠ `sejas.fresh.apk`
   - Spaces matter: `Sejas Fresh.apk` ≠ `Sejas.Fresh.apk`

3. **Browser security**: Some browsers block automatic downloads
   - Solution: Users can right-click → "Save As"

## ✅ After Fixing

1. Update `APK_DOWNLOAD_URL` in `src/App.tsx`
2. Run `npm run build`
3. Test the download button
4. Should download directly without redirecting!

---

**Need help?** Check the release page URL to find the exact tag name.
