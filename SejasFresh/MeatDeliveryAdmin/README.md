# 🥩 Meat Delivery Admin Dashboard

Admin web dashboard for managing the Meat Delivery App built with **React + TypeScript + Vite**.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Create `.env.local`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_UPLOADS_URL=http://localhost:5000/uploads
```

### 3. Run Development Server
```bash
npm run dev
```

The admin dashboard will be available at `http://localhost:3000`

## 📁 Project Structure

```
MeatDeliveryAdmin/
├── src/
│   ├── components/
│   │   └── Layout/
│   │       └── Layout.tsx        # Main layout with sidebar
│   ├── contexts/
│   │   └── AuthContext.tsx       # Authentication context
│   ├── pages/
│   │   ├── LoginPage.tsx          # Admin login
│   │   ├── DashboardPage.tsx     # Dashboard with stats
│   │   ├── ProductsPage.tsx      # Product management
│   │   ├── OrdersPage.tsx         # Order management
│   │   ├── UsersPage.tsx          # User management
│   │   └── CouponsPage.tsx        # Coupon management
│   ├── services/
│   │   └── api.ts                 # API service (Axios)
│   ├── App.tsx                    # Main app component
│   └── main.tsx                   # Entry point
├── index.html
├── vite.config.ts
└── tsconfig.json
```

## 🔐 Admin Features

- **Dashboard**: Overview statistics and charts
- **Products**: Create, update, delete products
- **Orders**: View and manage orders
- **Users**: Manage user accounts
- **Coupons**: Create and manage discount coupons

## 🔧 Technology Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI)
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Forms**: React Hook Form (ready to use)

## 📝 Notes

- All API calls are handled through the `api.ts` service
- Authentication is managed via JWT tokens stored in localStorage
- React Query handles data fetching and caching
- Material-UI provides the component library
