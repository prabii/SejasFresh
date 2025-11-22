const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getProductsByCategory,
  searchProducts,
  getSuggestedProducts
} = require('../controllers/productController');
const { optionalProtect } = require('../middleware/auth');

// Public routes
// IMPORTANT: Specific routes must come before parameterized routes
// Optional auth for personalized recommendations
router.get('/suggested', optionalProtect, getSuggestedProducts);
router.get('/search', searchProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/', getProducts);
router.get('/:id', getProductById);

module.exports = router;

