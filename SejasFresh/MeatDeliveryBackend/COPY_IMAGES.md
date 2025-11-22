# 📸 Copy Product Images to Backend

The product images need to be copied from the user app to the backend so they can be served via the API.

## 📁 Image Locations

- **Source**: `MeatDeliveryUserApp/assets/images/uploads/`
- **Destination**: `MeatDeliveryBackend/uploads/`

## 🚀 Quick Copy (Windows PowerShell)

From the project root (`D:\Downloads\Sejas`):

```powershell
# Create uploads directory if it doesn't exist
New-Item -ItemType Directory -Force -Path "MeatDeliveryBackend\uploads"

# Copy all images
Copy-Item -Path "MeatDeliveryUserApp\assets\images\uploads\*" -Destination "MeatDeliveryBackend\uploads\" -Recurse -Force
```

## 🚀 Quick Copy (Mac/Linux)

From the project root:

```bash
# Create uploads directory if it doesn't exist
mkdir -p MeatDeliveryBackend/uploads

# Copy all images
cp -r MeatDeliveryUserApp/assets/images/uploads/* MeatDeliveryBackend/uploads/
```

## ✅ Verify Images

After copying, verify that images are in the backend:

```bash
cd MeatDeliveryBackend
ls uploads/
```

You should see files like:
- `Tenderloin.jpg`
- `Ribeye.jpg`
- `Boti.jpg`
- `Beef-brisket.jpg`
- etc.

## 🌐 Access Images

Once copied and backend is running, images will be accessible at:

```
http://localhost:5000/uploads/Tenderloin.jpg
http://localhost:5000/uploads/Ribeye.jpg
http://localhost:5000/uploads/Boti.jpg
```

## 📝 Note

The backend serves static files from the `uploads/` folder. Make sure:
1. Images are copied before running the seed script
2. Backend server is running to serve images
3. `.env` file has correct `UPLOAD_DIR` setting

