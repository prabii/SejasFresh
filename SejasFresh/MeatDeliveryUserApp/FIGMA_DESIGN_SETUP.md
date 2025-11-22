# 🎨 Figma Design Implementation Guide

## ✅ What's Been Updated

### 1. **Premium Cuts Design - Matched to Figma**
- ✅ **Larger images**: 120px height (was 60px)
- ✅ **Better spacing**: 4 items per row with proper gaps
- ✅ **Enhanced cards**: Rounded corners (16px), shadows, borders
- ✅ **Improved typography**: Better font sizes and spacing
- ✅ **Image display**: Full coverage with `cover` mode

### 2. **Image System**
- ✅ **Smart image loading**: Automatically tries multiple filename variations
- ✅ **Figma-ready**: Supports PNG, JPG, JPEG formats
- ✅ **Fallback system**: Uses placeholder if image not found

## 📥 How to Export Images from Figma

### Method 1: Individual Export
1. Open Figma: https://www.figma.com/design/w0pfslJntfw8QWkhnlLIxN/Sejas-User-App?node-id=1-9861
2. Select each product image in the Premium Cuts section
3. Right-click → **Export** (or `Ctrl/Cmd + Shift + E`)
4. Choose:
   - Format: **PNG** (recommended) or **JPG**
   - Size: **2x** or **3x** (for retina displays)
5. Save with product name: `Tenderloin.png`, `Ribeye.png`, etc.

### Method 2: Batch Export
1. Select all product images at once
2. Right-click → **Export Selection**
3. Choose PNG, 2x resolution
4. Figma exports all as separate files

## 📁 Adding Images to App

### Option 1: Manual Copy
```bash
# Create folder
mkdir -p MeatDeliveryUserApp/assets/images/products

# Copy your exported images
# Example:
cp ~/Downloads/Tenderloin.png MeatDeliveryUserApp/assets/images/products/
cp ~/Downloads/Ribeye.png MeatDeliveryUserApp/assets/images/products/
```

### Option 2: Use Setup Script
```bash
# Export images from Figma to a folder (e.g., ~/Downloads/figma-exports)
# Then run:
node MeatDeliveryUserApp/scripts/setup-figma-images.js ~/Downloads/figma-exports
```

## 🎯 Image Naming

The system automatically tries these variations:
- `Tenderloin.png` / `Tenderloin.jpg`
- `tenderloin.png` / `tenderloin.jpg`
- `Tenderloin.png` / `Tenderloin.jpg`
- `tender-lion.png` (for "tender lion")

**Best practice**: Use exact product name with capital first letter:
- `Tenderloin.png`
- `Ribeye.png`
- `RibeyeSteak.png`

## 🎨 Design Specifications (From Figma)

### Premium Cuts Cards
- **Width**: 4 items per row (calculated dynamically)
- **Image Height**: 120px
- **Border Radius**: 16px
- **Shadow**: 
  - Offset: (0, 4)
  - Opacity: 0.12
  - Radius: 8px
- **Border**: 0.5px, color #f0f0f0
- **Spacing**: 12px gap between items

### Typography
- **Product Name**: 13px, weight 600, color #1a1a1a
- **Price**: 12px, weight 700, color #D13635
- **Letter Spacing**: 0.3 for price

## 🚀 Testing

After adding images:
```bash
# Clear cache and restart
cd MeatDeliveryUserApp
npx expo start --clear
```

## 📝 Current Status

✅ Design matches Figma specifications
✅ Image system ready for Figma exports
✅ Automatic image loading with fallbacks
⏳ Waiting for images to be exported from Figma

## 💡 Tips

1. **Export at 2x or 3x** for better quality on retina displays
2. **Use PNG** for images with transparency
3. **Use JPG** for photos (smaller file size)
4. **Keep file names simple**: Product name only
5. **Restart Expo** after adding images to see changes

## 🔍 Troubleshooting

**Images not showing?**
- Check file is in `assets/images/products/`
- Check filename matches product name (case-insensitive)
- Restart Expo with `--clear` flag
- Check console for error messages

**Images too small/large?**
- Adjust `height: 120` in `imageWrapper` style
- Adjust `width` calculation in `categoryBox` style

