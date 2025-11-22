# 🚚 Delivery Boy Signup Guide

This guide explains how to create delivery boy accounts for the delivery dashboard.

## 📋 Methods to Create Delivery Users

### Method 1: Using Admin Dashboard (Recommended)

1. **Login to Admin Dashboard**
   - Go to `http://localhost:3000`
   - Login with admin credentials

2. **Create Delivery User**
   - Navigate to "Users" page
   - Click "Add User" or "Create User"
   - Fill in the form:
     - First Name: (e.g., "John")
     - Last Name: (e.g., "Doe")
     - Email: (e.g., "john@delivery.com")
     - Password: (e.g., "delivery123")
     - Phone: (e.g., "+1234567890")
     - Role: Select "Delivery"
   - Click "Create"

3. **Delivery User Can Now Login**
   - Go to `http://localhost:3001`
   - Use the email and password you just created

---

### Method 2: Using Backend Script

1. **Navigate to Backend Directory**
   ```bash
   cd MeatDeliveryBackend
   ```

2. **Run the Create Delivery User Script**
   ```bash
   node src/scripts/createDeliveryUser.js "John" "john@delivery.com" "password123" "+1234567890"
   ```

   **Parameters:**
   - First Name
   - Email
   - Password
   - Phone (optional)

3. **Example:**
   ```bash
   node src/scripts/createDeliveryUser.js "Rahul" "rahul@delivery.com" "delivery123" "+919876543210"
   ```

---

### Method 3: Using API (Postman/curl)

**Register Delivery User via API:**

```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@delivery.com",
  "password": "delivery123",
  "phone": "+1234567890",
  "role": "delivery"
}
```

**Note:** The register endpoint accepts `role` parameter. Set it to `"delivery"` to create a delivery user.

---

### Method 4: Direct MongoDB (Advanced)

1. **Connect to MongoDB Atlas**
2. **Navigate to Collections → `meatdelivery` → `users`**
3. **Insert a new document:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@delivery.com",
  "password": "$2a$10$...", // bcrypt hash of password
  "phone": "+1234567890",
  "role": "delivery",
  "isActive": true,
  "emailVerified": true,
  "phoneVerified": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**To hash password:**
```javascript
const bcrypt = require('bcryptjs');
const hashedPassword = bcrypt.hashSync('delivery123', 10);
console.log(hashedPassword);
```

---

## 🔐 Login to Delivery Dashboard

After creating a delivery user:

1. **Start Delivery App** (if not running):
   ```bash
   cd MeatDeliveryDeliveryBoy
   npm run dev
   ```

2. **Open Browser:**
   - Go to `http://localhost:3001`

3. **Login:**
   - Email: (the email you created)
   - Password: (the password you set)

---

## ✅ Verification

After login, the delivery boy should see:
- Dashboard with order statistics
- "My Orders" page showing assigned orders
- Ability to mark orders as delivered

---

## 🔄 Create Multiple Delivery Users

You can create multiple delivery users using any of the methods above. Each delivery user will:
- Have their own login credentials
- See only orders assigned to them
- Be able to update order status to "delivered"

---

## ⚠️ Important Notes

1. **Email is Required**: Delivery users must have an email for login
2. **Password Required**: Delivery users login with email/password (not phone/PIN)
3. **Role Must be "delivery"**: Only users with `role: "delivery"` can access the delivery dashboard
4. **Active Status**: Ensure `isActive: true` for the user to be able to login

---

## 🆘 Troubleshooting

**Can't login?**
- Check if email and password are correct
- Verify `role: "delivery"` in database
- Check `isActive: true` in database
- Ensure backend server is running

**No orders showing?**
- Orders must be assigned to the delivery user by admin
- Check if orders have `assignedTo` field set to delivery user's ID
- Orders must be in "preparing" or "out-for-delivery" status

