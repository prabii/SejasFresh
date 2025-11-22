# 📋 Complete API Requirements List

This document lists all the APIs you need to implement in your backend for the Meat Delivery App.

## 🔗 Base URL Structure
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

---

## 🔐 1. Authentication APIs (`/api/auth`)

### 1.1 Register User (PIN-Based)
**POST** `/auth/register`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "pin": "123456",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "landmark": "Near Park"
  },
  "role": "customer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "671234567890abcdef123456",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "customer",
    "isActive": true,
    "phoneVerified": false,
    "emailVerified": false,
    "fullName": "John Doe"
  }
}
```

### 1.2 Login (Email/Password)
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response:** Same as register

### 1.3 Login with PIN
**POST** `/auth/login-pin`

**Request Body:**
```json
{
  "identifier": "john@example.com",
  "pin": "123456"
}
```

**Response:** Same as register

### 1.4 Request OTP
**POST** `/auth/request-otp`

**Request Body:**
```json
{
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "phone": "+1234567890",
    "expiresIn": "5 minutes"
  }
}
```

### 1.5 Verify OTP
**POST** `/auth/verify-otp`

**Request Body:**
```json
{
  "phone": "+1234567890",
  "otp": "123456"
}
```

**Response:** Same as register

### 1.6 Set PIN
**POST** `/auth/set-pin`

**Request Body:**
```json
{
  "pin": "123456",
  "confirmPin": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "PIN set successfully"
}
```

### 1.7 Forgot PIN - Request OTP
**POST** `/auth/forgot-pin`

**Request Body:**
```json
{
  "identifier": "john@example.com"
}
```

**Response:** Same as request OTP

### 1.8 Reset PIN
**POST** `/auth/reset-pin`

**Request Body:**
```json
{
  "identifier": "john@example.com",
  "otp": "123456",
  "newPin": "654321",
  "confirmPin": "654321"
}
```

**Response:**
```json
{
  "success": true,
  "message": "PIN reset successfully"
}
```

### 1.9 Get Current User Profile
**GET** `/auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "671234567890abcdef123456",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "savedAddresses": [...],
    "role": "customer"
  }
}
```

### 1.10 Update Profile
**PUT** `/auth/me`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  }
}
```

**Response:** Same as get profile

### 1.11 Change Password
**PUT** `/auth/change-password`

**Request Body:**
```json
{
  "currentPassword": "oldPassword",
  "newPassword": "newPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### 1.12 Logout
**POST** `/auth/logout`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🛍️ 2. Product APIs (`/api/products`)

### 2.1 Get All Products
**GET** `/products?page=1&limit=20&category=premium&search=steak`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `category` (optional): Filter by category
- `search` (optional): Search term

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "product_id",
        "id": "product_id",
        "name": "Tenderloin",
        "description": "Premium cut",
        "price": 1200,
        "discountedPrice": 1000,
        "image": "http://localhost:5000/uploads/tenderloin.jpg",
        "images": [
          {
            "_id": "img_id",
            "url": "http://localhost:5000/uploads/tenderloin.jpg",
            "alt": "Tenderloin"
          }
        ],
        "category": "premium",
        "subcategory": "steak",
        "rating": 4.5,
        "ratings": {
          "average": 4.5,
          "count": 120
        },
        "deliveryTime": "Next day 6 AM",
        "isActive": true,
        "availability": {
          "inStock": true,
          "quantity": 50
        },
        "weight": {
          "value": 1,
          "unit": "kg"
        },
        "discount": {
          "percentage": 20,
          "validUntil": "2024-12-31"
        },
        "preparationMethod": "Fresh",
        "tags": ["premium", "fresh", "organic"],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 5,
      "total": 100,
      "limit": 20
    }
  }
}
```

### 2.2 Get Product by ID
**GET** `/products/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "product_id",
    "name": "Tenderloin",
    ...
  }
}
```

### 2.3 Get Products by Category
**GET** `/products/category/:category`

**Response:** Same as get all products

### 2.4 Search Products
**GET** `/products/search?q=steak`

**Response:** Same as get all products

### 2.5 Get Suggested Products
**GET** `/products/suggested?limit=10`

**Response:** Same as get all products

---

## 🛒 3. Cart APIs (`/api/cart`)

### 3.1 Get User's Cart
**GET** `/cart`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "cart_id",
    "user": "user_id",
    "items": [
      {
        "_id": "item_id",
        "product": {
          "_id": "product_id",
          "name": "Tenderloin",
          "price": 1200,
          "discountedPrice": 1000,
          "images": [...],
          ...
        },
        "quantity": 2,
        "priceAtTime": 1000
      }
    ],
    "totalItems": 2,
    "totalAmount": 2000,
    "subtotal": 2000,
    "discountAmount": 0,
    "finalAmount": 2000,
    "formattedTotal": "₹2,000.00",
    "appliedCoupon": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3.2 Add Item to Cart
**POST** `/cart/add`

**Request Body:**
```json
{
  "productId": "product_id",
  "quantity": 2
}
```

**Response:** Same as get cart

### 3.3 Update Cart Item Quantity
**PUT** `/cart/update/:itemId`

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response:** Same as get cart

### 3.4 Remove Item from Cart
**DELETE** `/cart/remove/:itemId`

**Response:** Same as get cart

### 3.5 Clear Cart
**DELETE** `/cart/clear`

**Response:** Same as get cart

### 3.6 Get Cart Summary
**GET** `/cart/summary`

**Response:**
```json
{
  "success": true,
  "data": {
    "itemCount": 2,
    "totalAmount": 2000,
    "formattedTotal": "₹2,000.00",
    "items": [
      {
        "productId": "product_id",
        "name": "Tenderloin",
        "quantity": 2,
        "priceAtTime": 1000,
        "subtotal": 2000
      }
    ]
  }
}
```

### 3.7 Apply Coupon to Cart
**POST** `/cart/apply-coupon`

**Request Body:**
```json
{
  "code": "SAVE20"
}
```

**Response:** Same as get cart (with appliedCoupon populated)

### 3.8 Remove Coupon from Cart
**DELETE** `/cart/remove-coupon`

**Response:** Same as get cart

---

## 📦 4. Order APIs (`/api/orders`)

### 4.1 Create Order
**POST** `/orders`

**Request Body:**
```json
{
  "items": [
    {
      "product": "product_id",
      "quantity": 2
    }
  ],
  "savedAddressId": "address_id",
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  },
  "contactInfo": {
    "phone": "+1234567890",
    "email": "john@example.com"
  },
  "paymentMethod": "cash-on-delivery",
  "specialInstructions": "Please deliver before 6 PM",
  "orderNumber": "ORD1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "order_id",
    "id": "order_id",
    "orderNumber": "ORD1234567890",
    "customer": {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "items": [...],
    "deliveryAddress": {...},
    "contactInfo": {...},
    "pricing": {
      "subtotal": 2000,
      "deliveryFee": 50,
      "tax": 200,
      "total": 2250,
      "discount": 0
    },
    "paymentInfo": {
      "method": "cash-on-delivery",
      "status": "pending"
    },
    "status": "pending",
    "statusHistory": [...],
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "formattedTotal": "₹2,250.00"
  }
}
```

### 4.2 Get User's Orders
**GET** `/orders?page=1&limit=10`

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [/* array of orders */],
    "pagination": {
      "current": 1,
      "pages": 5,
      "total": 50,
      "limit": 10
    }
  }
}
```

### 4.3 Get Order by ID
**GET** `/orders/:id`

**Response:**
```json
{
  "success": true,
  "data": {/* order object */}
}
```

### 4.4 Cancel Order
**PATCH** `/orders/:id/cancel`

**Request Body:**
```json
{
  "reason": "Changed my mind"
}
```

**Response:** Same as get order

### 4.5 Update Order Status (Admin)
**PATCH** `/orders/:id/status`

**Request Body:**
```json
{
  "status": "confirmed",
  "notes": "Order confirmed"
}
```

**Response:** Same as get order

### 4.6 Assign Delivery (Admin)
**PATCH** `/orders/:id/assign`

**Request Body:**
```json
{
  "assignedTo": "delivery_person_id",
  "estimatedTime": "60 minutes",
  "notes": "Assigned to John"
}
```

**Response:** Same as get order

### 4.7 Get Order Statistics (Admin)
**GET** `/orders/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 1000,
    "totalRevenue": 500000,
    "statusBreakdown": [
      {
        "_id": "pending",
        "count": 50,
        "totalRevenue": 25000
      }
    ]
  }
}
```

---

## 📍 5. Address APIs (`/api/addresses`)

### 5.1 Get All Saved Addresses
**GET** `/addresses`

**Response:**
```json
{
  "success": true,
  "addresses": [
    {
      "_id": "address_id",
      "label": "Home",
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "landmark": "Near Park",
      "isDefault": true,
      "coordinates": {
        "latitude": 40.7128,
        "longitude": -74.0060
      }
    }
  ],
  "count": 1
}
```

### 5.2 Add Address
**POST** `/addresses`

**Request Body:**
```json
{
  "label": "Home",
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "landmark": "Near Park",
  "isDefault": true,
  "coordinates": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Address added successfully",
  "address": {/* address object */}
}
```

### 5.3 Update Address
**PUT** `/addresses/:id`

**Request Body:** Same as add address

**Response:** Same as add address

### 5.4 Delete Address
**DELETE** `/addresses/:id`

**Response:**
```json
{
  "success": true,
  "message": "Address deleted successfully",
  "addresses": [/* remaining addresses */]
}
```

### 5.5 Set Default Address
**PATCH** `/addresses/:id/default`

**Response:**
```json
{
  "success": true,
  "message": "Default address updated",
  "addresses": [/* all addresses with updated default */]
}
```

### 5.6 Get Default Address
**GET** `/addresses/default`

**Response:**
```json
{
  "success": true,
  "address": {/* address object or null */}
}
```

---

## 🎟️ 6. Coupon APIs (`/api/coupons`)

### 6.1 Get Active Coupons (Public)
**GET** `/coupons/active`

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "coupon_id",
        "code": "SAVE20",
        "description": "Save 20% on your order",
        "type": "percentage",
        "value": 20,
        "minimumOrderValue": 1000,
        "maximumDiscount": 500,
        "formattedDiscount": "20% off",
        "validFrom": "2024-01-01T00:00:00.000Z",
        "validTo": "2024-12-31T23:59:59.000Z"
      }
    ]
  }
}
```

### 6.2 Validate Coupon
**POST** `/coupons/validate`

**Request Body:**
```json
{
  "code": "SAVE20",
  "orderAmount": 2000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "coupon": {/* coupon object */},
    "discount": 400,
    "applicableAmount": 2000
  }
}
```

### 6.3 Apply Coupon
**POST** `/coupons/apply`

**Request Body:**
```json
{
  "code": "SAVE20"
}
```

**Response:** Same as validate coupon

---

## 🔔 7. Notification APIs (`/api/notifications`)

### 7.1 Get Notifications
**GET** `/notifications?page=1&limit=20&category=order&isRead=false&type=order`

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "notification_id",
        "id": "notification_id",
        "title": "Order Confirmed",
        "message": "Your order #ORD123 has been confirmed",
        "type": "order",
        "category": "order",
        "priority": "high",
        "isRead": false,
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "metadata": {
          "orderId": {
            "orderNumber": "ORD123",
            "status": "confirmed"
          }
        }
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 5,
      "total": 100,
      "limit": 20
    }
  }
}
```

### 7.2 Get Notification by ID
**GET** `/notifications/:id`

**Response:**
```json
{
  "success": true,
  "data": {/* notification object */}
}
```

### 7.3 Mark as Read
**PATCH** `/notifications/:id/read`

**Response:** Same as get notification

### 7.4 Mark All as Read
**PATCH** `/notifications/read-all`

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "modifiedCount": 10
  }
}
```

### 7.5 Get Unread Count
**GET** `/notifications/unread-count`

**Response:**
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

### 7.6 Delete Notification
**DELETE** `/notifications/:id`

**Response:**
```json
{
  "success": true,
  "message": "Notification deleted"
}
```

### 7.7 Clear All Notifications
**DELETE** `/notifications/clear-all`

**Response:**
```json
{
  "success": true,
  "message": "All notifications cleared",
  "data": {
    "modifiedCount": 50
  }
}
```

### 7.8 Get Notification Preferences
**GET** `/notifications/preferences`

**Response:**
```json
{
  "success": true,
  "data": {
    "push": true,
    "email": true,
    "sms": false,
    "inApp": true
  }
}
```

### 7.9 Update Notification Preferences
**PUT** `/notifications/preferences`

**Request Body:**
```json
{
  "push": true,
  "email": true,
  "sms": false,
  "inApp": true
}
```

**Response:** Same as get preferences

### 7.10 Send Welcome Notification
**POST** `/notifications/welcome`

**Request Body:**
```json
{
  "userId": "user_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Welcome notification sent"
}
```

---

## 👤 8. User APIs (`/api/users`)

### 8.1 Update Push Token
**POST** `/users/push-token`

**Request Body:**
```json
{
  "pushToken": "ExponentPushToken[xxxxx]",
  "platform": "ios"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Push token updated"
}
```

---

## 📝 Notes

1. **Authentication**: All protected endpoints require `Authorization: Bearer <token>` header
2. **Image URLs**: Product images should be served from `/uploads/` directory
3. **Error Responses**: All errors should follow this format:
   ```json
   {
     "success": false,
     "message": "Error message",
     "error": "Detailed error"
   }
   ```
4. **Pagination**: Use page-based pagination with `page` and `limit` query parameters
5. **File Uploads**: Product images should be uploaded to `/uploads/` directory and URLs should be stored in database

---

## 🖼️ Image Files Available

The following images are available in `/uploads/` directory:
- back ribs.jpg
- Beef-brisket.jpg
- Boti.jpg
- bottom round.jpeg
- Flank Steak.jpeg
- ground chuck.avif
- ground-chuck.jpg
- heart.jpg
- kidney.jpeg
- Liver.jpg
- long loin.jpeg
- raw-flat-iron.jpg
- raw-shoulder-steak.jpg
- rib roast.jpg
- rib.webp
- ribeye steak.jpeg
- Ribeye.jpg
- rump roast.jpeg
- rump roast.jpg
- shank.jpeg
- short loin.jpeg
- short rib.webp
- short ribs.jpeg
- shoulder steak.jpeg
- Skirt steak.jpeg
- tender lion.webp (Tenderloin)
- Tenderloin.jpg
- top round.jpeg
- Toungue.jpeg
- Tripe.jpeg

Make sure your backend serves these images at: `http://your-domain.com/uploads/filename.jpg`

