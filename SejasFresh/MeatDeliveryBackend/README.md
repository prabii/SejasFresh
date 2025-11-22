# 🥩 Meat Delivery Backend API

Backend API server for the Meat Delivery App built with Node.js, Express, and MongoDB.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
```bash
cp .env.example .env
# The .env.example already has MongoDB connection string configured
# Edit .env if you need to change any other settings
```

### 3. MongoDB Connection
The backend is configured to use MongoDB Atlas:
- Connection string is already set in `.env.example`
- Database: `meatdelivery`
- No local MongoDB installation needed

### 4. Run the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📁 Project Structure

```
MeatDeliveryBackend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── cloudinary.js        # Image upload config (optional)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   ├── addressController.js
│   │   ├── couponController.js
│   │   ├── notificationController.js
│   │   └── adminController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   ├── Address.js
│   │   ├── Coupon.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── addressRoutes.js
│   │   ├── couponRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── adminRoutes.js
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── upload.js            # File upload (multer)
│   │   ├── errorHandler.js      # Error handling
│   │   └── validate.js          # Request validation
│   ├── utils/
│   │   ├── generateOTP.js
│   │   ├── sendSMS.js
│   │   ├── sendEmail.js
│   │   └── helpers.js
│   └── server.js                 # Main server file
├── uploads/                      # Product images
├── .env                          # Environment variables
├── .env.example                  # Example env file
└── package.json
```

## 📋 API Endpoints

See `API_SUMMARY.md` in the root directory for complete API documentation.

**Total APIs: 65**

- Authentication: 12 APIs
- Products: 5 APIs
- Cart: 8 APIs
- Orders: 7 APIs
- Addresses: 6 APIs
- Coupons: 3 APIs
- Notifications: 10 APIs
- Users: 1 API
- Admin: 13 APIs

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## 📤 File Uploads

Product images are uploaded to `/uploads` directory and served statically at:
```
http://localhost:5000/uploads/filename.jpg
```

## 🧪 Testing

Use Postman or any API client to test the endpoints. Import the API collection from the `docs` folder.

## 📝 Notes

- All timestamps are in ISO 8601 format
- All prices are in Indian Rupees (₹)
- Image URLs are absolute URLs pointing to the server

