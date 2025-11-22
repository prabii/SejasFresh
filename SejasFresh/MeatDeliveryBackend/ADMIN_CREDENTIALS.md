# 🔐 Admin Credentials

## Default Admin Account

### Credentials:
- **Email**: `admin@sejas.com`
- **Password**: `admin123`

## 🚀 Setup Admin User

### Option 1: Create Admin via Script (Recommended)

Run the create admin script:

```bash
cd MeatDeliveryBackend
npm run create-admin
```

This will create the admin user in your MongoDB database.

### Option 2: Create Admin via API

After starting the backend server, use the register API:

```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@sejas.com",
  "password": "admin123",
  "phone": "+1234567890",
  "role": "admin"
}
```

### Option 3: Create Admin via MongoDB Directly

You can also create the admin user directly in MongoDB Atlas:

1. Go to MongoDB Atlas
2. Connect to your cluster
3. Navigate to Collections → `meatdelivery` → `users`
4. Insert a new document with:
   ```json
   {
     "firstName": "Admin",
     "lastName": "User",
     "email": "admin@sejas.com",
     "password": "$2a$10$...", // bcrypt hash of "admin123"
     "phone": "+1234567890",
     "role": "admin",
     "isActive": true,
     "emailVerified": true,
     "phoneVerified": true
   }
   ```

## ⚠️ Security Notes

1. **Change Password Immediately**: After first login, change the default password
2. **Use Strong Password**: Use a strong, unique password for production
3. **Keep Credentials Secure**: Don't commit credentials to version control

## 🔄 Change Admin Password

### Via API:
```bash
PUT http://localhost:5000/api/auth/change-password
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "currentPassword": "admin123",
  "newPassword": "your-new-strong-password"
}
```

### Via Admin Dashboard:
1. Login to admin dashboard
2. Go to Profile/Settings
3. Change password section

## 📝 Login to Admin Dashboard

1. Start the admin frontend: `cd MeatDeliveryAdmin && npm run dev`
2. Go to `http://localhost:3000/login`
3. Enter:
   - Email: `admin@sejas.com`
   - Password: `admin123`

