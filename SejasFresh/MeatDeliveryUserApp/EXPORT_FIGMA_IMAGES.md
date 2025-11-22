# 🎨 How to Export Images from Figma

## Step 1: Export Images from Figma

1. **Open your Figma file**: https://www.figma.com/design/w0pfslJntfw8QWkhnlLIxN/Sejas-User-App

2. **Select the Premium Cuts section** (node-id=1-9861)

3. **For each product image:**
   - Select the image/frame
   - Right-click → **Export** or use `Ctrl/Cmd + Shift + E`
   - Choose format: **PNG** or **JPG**
   - Set resolution: **2x** or **3x** (for better quality)
   - Click **Export**

4. **Save images with these names:**
   - `Tenderloin.png` (or `.jpg`)
   - `Ribeye.png`
   - `RibeyeSteak.png`
   - Any other premium cut images

## Step 2: Copy Images to App

```bash
# Create products folder
mkdir -p MeatDeliveryUserApp/assets/images/products

# Copy exported images here
# Example:
# cp ~/Downloads/Tenderloin.png MeatDeliveryUserApp/assets/images/products/
# cp ~/Downloads/Ribeye.png MeatDeliveryUserApp/assets/images/products/
```

## Step 3: Update Image Mapping

The images will be automatically loaded once you add them to the folder!

## Alternative: Export All at Once

1. Select all product images in Figma
2. Right-click → **Export Selection**
3. Choose **PNG** format, **2x** resolution
4. Figma will export all as separate files
5. Copy all to `assets/images/products/` folder

