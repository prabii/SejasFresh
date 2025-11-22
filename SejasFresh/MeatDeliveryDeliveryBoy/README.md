# Delivery Boy Dashboard

Web application for delivery personnel to manage assigned orders.

## Features

- **Dashboard**: View order statistics and recent orders
- **Order Management**: View assigned orders and update delivery status
- **Customer Contact**: Call customers directly from the dashboard
- **Status Updates**: Mark orders as delivered

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```
VITE_API_URL=http://localhost:5000/api
```

3. Start development server:
```bash
npm run dev
```

The app will run on `http://localhost:3001`

## Login

Delivery boys can login with their email and password. The user must have `role: 'delivery'` in the database.

## API Endpoints

- `GET /api/delivery/orders` - Get all assigned orders
- `GET /api/delivery/orders/:id` - Get order details
- `PATCH /api/delivery/orders/:id/status` - Update order status (can only mark as delivered)

## Build

```bash
npm run build
```

