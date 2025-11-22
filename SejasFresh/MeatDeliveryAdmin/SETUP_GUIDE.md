# 🚀 Admin Dashboard Setup Guide

## ✅ What's Been Created

A complete **React + TypeScript** admin dashboard using **Vite** as the build tool.

## 📦 Technology Stack

- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Fast Build Tool
- **Material-UI (MUI)** - Component Library
- **React Router** - Routing
- **React Query** - Data Fetching & Caching
- **Axios** - HTTP Client

## 🏗️ Project Structure

```
MeatDeliveryAdmin/
├── src/
│   ├── components/
│   │   └── Layout/
│   │       └── Layout.tsx          ✅ Main layout with sidebar
│   ├── contexts/
│   │   └── AuthContext.tsx         ✅ Authentication context
│   ├── pages/
│   │   ├── LoginPage.tsx           ✅ Admin login page
│   │   ├── DashboardPage.tsx       ✅ Dashboard with statistics
│   │   ├── ProductsPage.tsx         ✅ Product management
│   │   ├── OrdersPage.tsx           ✅ Order management
│   │   ├── UsersPage.tsx            ✅ User management
│   │   └── CouponsPage.tsx          ✅ Coupon management
│   ├── services/
│   │   └── api.ts                   ✅ API service (Axios)
│   ├── App.tsx                      ✅ Main app with routes
│   ├── main.tsx                     ✅ Entry point
│   └── index.css                    ✅ Global styles
├── index.html                       ✅ HTML template
├── vite.config.ts                   ✅ Vite configuration
├── tsconfig.json                    ✅ TypeScript config
└── package.json                     ✅ Dependencies
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd MeatDeliveryAdmin
npm install
```

### 2. Create Environment File
Create `.env.local`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_UPLOADS_URL=http://localhost:5000/uploads
```

### 3. Start Development Server
```bash
npm run dev
```

The admin dashboard will open at `http://localhost:3000`

## 📋 Features Implemented

### ✅ Authentication
- Login page with email/password
- JWT token management
- Protected routes
- Auto-logout on token expiry

### ✅ Dashboard
- Statistics cards (Orders, Revenue, Products, Users)
- Real-time data fetching
- Loading states

### ✅ Products Management
- View all products
- Add/Edit/Delete products
- Product table with filters

### ✅ Orders Management
- View all orders
- Order status tracking
- Order details

### ✅ Users Management
- View all users
- User status management
- User details

### ✅ Coupons Management
- View active coupons
- Create/Delete coupons
- Coupon validation

## 🔐 Default Admin Credentials

You'll need to create an admin user in the backend first. Use the backend API to register an admin user:

```bash
POST /api/auth/register
{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@sejas.com",
  "password": "admin123",
  "role": "admin"
}
```

## 📝 Next Steps

1. **Install dependencies**: `npm install`
2. **Configure backend URL** in `.env.local`
3. **Start backend server** (port 5000)
4. **Run admin dashboard**: `npm run dev`
5. **Login** with admin credentials

## 🎨 Customization

- **Theme Colors**: Edit `src/main.tsx` - theme palette
- **API Base URL**: Edit `.env.local` - `VITE_API_URL`
- **Routes**: Edit `src/App.tsx` - add new routes
- **Components**: Add new components in `src/components/`

## 📚 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

