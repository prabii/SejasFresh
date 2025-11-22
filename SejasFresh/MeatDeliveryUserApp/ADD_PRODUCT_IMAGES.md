# 📸 How to Add Product Images

## Current Status
Premium cuts images are now properly sized and displayed, but using placeholder images.

## To Add Actual Product Images

### Step 1: Create Products Folder
```bash
mkdir -p MeatDeliveryUserApp/assets/images/products
```

### Step 2: Copy Images from Backend
Copy the following images from `MeatDeliveryBackend/uploads/` to `MeatDeliveryUserApp/assets/images/products/`:

**Premium Cuts:**
- `Tenderloin.jpg` → `Tenderloin.jpg`
- `Ribeye.jpg` → `Ribeye.jpg` (or `ribeye steak.jpeg`)

**Normal Products:**
- `Boti.jpg` → `Boti.jpg`
- `Beef-brisket.jpg` → `BeefBrisket.jpg`
- `short ribs.jpeg` → `ShortRibs.jpg`
- `ground-chuck.jpg` → `GroundChuck.jpg`
- `Flank Steak.jpeg` → `FlankSteak.jpg`
- `Skirt steak.jpeg` → `SkirtSteak.jpg`

### Step 3: Update Image Mapping
After adding images, update `data/mockData.ts` in the `getProductImage` function to reference the actual images:

```typescript
if (productName === 'Tenderloin') {
  return require('../assets/images/products/Tenderloin.jpg');
}
if (productName === 'Ribeye Steak') {
  return require('../assets/images/products/Ribeye.jpg');
}
// ... etc
```

## Image Requirements

- **Format**: JPG, PNG, or WebP
- **Size**: Recommended 400x400px or larger
- **Aspect Ratio**: Square (1:1) works best for grid display
- **File Size**: Keep under 500KB for better performance

## Current Fixes Applied

✅ Images now display at **110px height** (was 60px)
✅ Using `contentFit="cover"` for full image display
✅ Proper image wrapper with rounded corners
✅ Better card styling with shadows
✅ Images fill the entire container

## Testing

After adding images:
1. Restart Expo: `npx expo start --clear`
2. Check premium cuts section
3. Images should display fully and clearly

