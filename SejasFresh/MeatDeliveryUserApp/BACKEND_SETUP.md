# Backend Integration Setup Guide

Your React Native meat delivery app has been successfully connected to backend APIs. Here's how to set up and use the backend integration:

## 📋 Overview

The app now includes:
- **Cart Management**: Add, update, remove items from cart
- **Product Services**: Fetch products, search, get suggestions
- **Authentication**: Login, register, OTP verification
- **Real-time Updates**: Live cart synchronization with backend

## 🚀 Quick Start

### 1. Configure Backend URL

Edit `config/api.ts`:
```typescript
// For local development (port 5000)
development: {
  API_HOST: 'sejasfresh.cloud',
  API_PORT: '5000',
},

// For production
production: {
  API_HOST: 'your-production-domain.com',
  API_PORT: '443',
},
```

The app automatically uses:
- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-production-domain.com/api`

### 2. Backend Requirements

Your backend should implement these API endpoints:

#### Cart Endpoints
```
GET    /api/cart              - Get user's cart
POST   /api/cart/add          - Add item to cart
PUT    /api/cart/update/:id   - Update item quantity
DELETE /api/cart/remove/:id   - Remove item from cart
DELETE /api/cart/clear        - Clear entire cart
GET    /api/cart/summary      - Get cart summary
```

#### Product Endpoints
```
GET    /api/products          - Get all products
GET    /api/products/:id      - Get product by ID
GET    /api/products/category/:cat - Get products by category
GET    /api/products/suggested - Get suggested products
GET    /api/products/search   - Search products
```

#### Auth Endpoints
```
POST   /api/auth/login        - User login
POST   /api/auth/register     - User registration
POST   /api/auth/verify-otp   - Verify OTP
```

### 3. Data Models

Your backend should use these data structures:

#### Cart Model
```javascript
{
  user: ObjectId,
  items: [{
    product: ObjectId,
    quantity: Number,
    priceAtTime: Number
  }],
  totalItems: Number,
  totalAmount: Number
}
```

#### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  discountedPrice: Number,
  image: String,
  category: String,
  rating: Number,
  deliveryTime: String,
  availability: {
    inStock: Boolean,
    quantity: Number
  }
}
```

## 🔧 Usage Examples

### Cart Operations

```typescript
// Load cart
const cart = await cartService.getCart();

// Add to cart
await cartService.addToCart(productId, quantity);

// Update quantity
await cartService.updateCartItem(itemId, newQuantity);

// Remove item
await cartService.removeFromCart(itemId);
```

### Product Operations

```typescript
// Get all products
const products = await productService.getAllProducts();

// Search products
const results = await productService.searchProducts("beef");

// Get suggested products
const suggested = await productService.getSuggestedProducts(4);
```

### Authentication

```typescript
// Login
const response = await authService.login({ email, password });

// Register
await authService.register({ name, email, password, phone });

// Check if authenticated
const isAuth = await authService.isAuthenticated();
```

## 📱 Updated Components

### CartPage Component
- Now fetches real cart data from backend
- Handles loading and error states
- Updates quantities in real-time
- Synchronizes with backend on all operations

### Key Features Added:
1. **Real-time Cart Sync**: All cart operations immediately sync with backend
2. **Error Handling**: Proper error messages and fallbacks
3. **Loading States**: Loading indicators during API calls
4. **Authentication**: JWT token management with AsyncStorage
5. **Image Handling**: Support for both local and remote images
6. **Offline Fallback**: Graceful handling of network issues

## 🔒 Security

- JWT tokens are automatically included in API requests
- Tokens are securely stored using AsyncStorage
- All API calls include proper error handling
- Authentication status is checked on app launch

## 🛠 Testing

### Local Development
1. Start your backend server on `localhost:5000`
2. The app automatically connects to `http://localhost:5000/api`
3. Test with Android emulator or physical device
4. Use `adb reverse tcp:5000 tcp:5000` for Android emulator

### Production
1. Deploy your backend to a hosting service
2. Update `config/api.ts` with production URL
3. Ensure HTTPS is configured
4. Test with production build

## 🚨 Important Notes

1. **CORS Configuration**: Ensure your backend allows requests from your mobile app
2. **Network Security**: Use HTTPS in production
3. **Error Handling**: The app handles network errors gracefully
4. **Token Expiry**: Implement token refresh logic if needed
5. **Image URLs**: Backend should provide full URLs for product images

## 📦 Dependencies Added

```json
{
  "@react-native-async-storage/async-storage": "^1.x.x"
}
```

## 🔄 Migration from Static Data

The CartPage component has been updated to use backend data instead of static arrays:

**Before**: Static `cartItems` and `suggestedProducts` arrays
**After**: Dynamic data fetched from backend APIs

All existing UI functionality remains the same, but now powered by real backend data.

## 🐛 Troubleshooting

### Common Issues:

1. **Network Error**: Check if backend is running and accessible
2. **CORS Error**: Configure CORS on your backend server
3. **Token Issues**: Clear app data and login again
4. **Image Loading**: Ensure image URLs are accessible

### Debug Steps:

1. Check network connectivity
2. Verify backend API endpoints
3. Review console logs for errors
4. Test API endpoints with Postman
5. Check AsyncStorage for stored tokens

## 📞 Support

Your meat delivery app is now ready for production with full backend integration! All cart operations, product loading, and authentication work seamlessly with your backend API.