# 🌱 Seed Products to Database

This guide explains how to populate your MongoDB database with all the products from the user app.

## 📋 Prerequisites

1. MongoDB connection configured in `.env`
2. Admin user created (run `npm run create-admin` first)
3. Backend dependencies installed

## 🚀 Quick Start

Run the seed script to populate all products:

```bash
cd MeatDeliveryBackend
npm run seed-products
```

## 📦 What Gets Seeded

The script will create the following products:

### Premium Cuts (6 products)
- Loin
- Shank
- Brisket
- Chuck
- Tenderloin
- Ribeye Steak

### Instant Deliverables (3 products)
- Beef
- Buffalo Liver
- Buffalo Brain

### Normal Products (6 products)
- Boti
- Beef Brisket
- Short Ribs
- Ground Chuck
- Flank Steak
- Skirt Steak

**Total: 15 products**

## 🖼️ Image Mapping

The script automatically maps product names to image files in the `uploads` folder:

- **Loin** → `short loin.jpeg`
- **Shank** → `shank.jpeg`
- **Brisket** → `Beef-brisket.jpg`
- **Chuck** → `ground-chuck.jpg`
- **Tenderloin** → `Tenderloin.jpg`
- **Ribeye Steak** → `Ribeye.jpg`
- **Boti** → `Boti.jpg`
- **Short Ribs** → `short ribs.jpeg`
- **Ground Chuck** → `ground-chuck.jpg`
- **Flank Steak** → `Flank Steak.jpeg`
- **Skirt Steak** → `Skirt steak.jpeg`
- **Buffalo Liver** → `Liver.jpg`
- **Buffalo Brain** → `Liver.jpg` (placeholder)
- **Beef** → `Beef-brisket.jpg`

## ⚠️ Important Notes

1. **Duplicate Prevention**: The script checks if a product with the same name already exists. If it does, it skips that product.

2. **Image Files**: Make sure all image files are present in the `MeatDeliveryBackend/uploads/` folder. The script references these files by name.

3. **No Deletion**: The script does NOT delete existing products. It only adds new ones.

4. **Image URLs**: After seeding, product images will be accessible at:
   ```
   http://localhost:5000/uploads/{image-filename}
   ```

## 🔄 Re-seeding

If you want to re-seed (e.g., after clearing the database):

1. Clear products manually in MongoDB or use:
   ```javascript
   // In MongoDB shell or admin panel
   db.products.deleteMany({})
   ```

2. Run the seed script again:
   ```bash
   npm run seed-products
   ```

## ✅ Verification

After seeding, verify products in:

1. **Admin Dashboard**: 
   - Go to `http://localhost:3000/products`
   - You should see all 15 products with images

2. **API Endpoint**:
   ```bash
   GET http://localhost:5000/api/products
   ```

3. **MongoDB Atlas**:
   - Check the `products` collection in your database

## 🎯 Next Steps

1. ✅ Run seed script: `npm run seed-products`
2. ✅ Verify products in admin dashboard
3. ✅ Test product display in user app
4. ✅ Add more products via admin dashboard if needed

## 📝 Customization

To add more products or modify existing ones:

1. Edit `src/scripts/seedProducts.js`
2. Add product objects to the `products` array
3. Update `getImageFileName()` function for new image mappings
4. Run `npm run seed-products` again

