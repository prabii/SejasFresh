const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;

    // Build query
    const query = { isActive: true };
    if (category) {
      query.category = category;
    }
    if (search) {
      query.$text = { $search: search };
    }

    // Get products
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Product.countDocuments(query);

    // Format image URLs
    const formattedProducts = products.map(product => {
      const productObj = product.toObject();
      if (productObj.image) {
        productObj.image = `${req.protocol}://${req.get('host')}/uploads/${productObj.image}`;
      }
      if (productObj.images) {
        productObj.images = productObj.images.map(img => ({
          ...img,
          url: `${req.protocol}://${req.get('host')}/uploads/${img.url}`
        }));
      }
      return productObj;
    });

    res.json({
      success: true,
      data: {
        data: formattedProducts,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const productObj = product.toObject();
    if (productObj.image) {
      productObj.image = `${req.protocol}://${req.get('host')}/uploads/${productObj.image}`;
    }
    if (productObj.images) {
      productObj.images = productObj.images.map(img => ({
        ...img,
        url: `${req.protocol}://${req.get('host')}/uploads/${img.url}`
      }));
    }

    res.json({
      success: true,
      data: productObj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
exports.getProductsByCategory = async (req, res, next) => {
  try {
    const category = req.params.category;
    const products = await Product.find({ category, isActive: true }).sort({ createdAt: -1 });

    const formattedProducts = products.map(product => {
      const productObj = product.toObject();
      if (productObj.image) {
        productObj.image = `${req.protocol}://${req.get('host')}/uploads/${productObj.image}`;
      }
      return productObj;
    });

    res.json({
      success: true,
      data: formattedProducts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
exports.searchProducts = async (req, res, next) => {
  try {
    const searchTerm = req.query.q;

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Please provide search term'
      });
    }

    const products = await Product.find({
      $text: { $search: searchTerm },
      isActive: true
    }).sort({ createdAt: -1 });

    const formattedProducts = products.map(product => {
      const productObj = product.toObject();
      if (productObj.image) {
        productObj.image = `${req.protocol}://${req.get('host')}/uploads/${productObj.image}`;
      }
      return productObj;
    });

    res.json({
      success: true,
      data: formattedProducts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get suggested products (personalized based on user orders if authenticated)
// @route   GET /api/products/suggested
// @access  Public (with optional user-based personalization)
exports.getSuggestedProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    let products = [];

    // If user is authenticated, get personalized recommendations based on order history
    if (req.user && req.user._id) {
      const Order = require('../models/Order');
      
      // Get user's recent orders to find frequently ordered categories
      const userOrders = await Order.find({ 
        customer: req.user._id,
        status: { $in: ['delivered', 'confirmed', 'preparing', 'out-for-delivery'] }
      })
        .populate('items.product', 'category subcategory')
        .sort({ createdAt: -1 })
        .limit(10);

      // Extract categories and subcategories from user's order history
      const userCategories = new Set();
      const userSubcategories = new Set();
      const orderedProductIds = new Set();

      userOrders.forEach(order => {
        order.items.forEach(item => {
          if (item.product) {
            if (item.product.category) userCategories.add(item.product.category);
            if (item.product.subcategory) userSubcategories.add(item.product.subcategory);
            orderedProductIds.add(item.product._id.toString());
          }
        });
      });

      // Get products from user's preferred categories, excluding already ordered products
      if (userCategories.size > 0) {
        const categoryArray = Array.from(userCategories);
        products = await Product.find({
          isActive: true,
          category: { $in: categoryArray },
          _id: { $nin: Array.from(orderedProductIds) }
        })
          .sort({ 'ratings.average': -1, createdAt: -1 })
          .limit(limit);
      }

      // If not enough products from user's categories, fill with popular products
      if (products.length < limit) {
        const remaining = limit - products.length;
        const existingIds = products.map(p => p._id.toString());
        const additionalProducts = await Product.find({
          isActive: true,
          _id: { $nin: [...existingIds, ...Array.from(orderedProductIds)] }
        })
          .sort({ 'ratings.average': -1, createdAt: -1 })
          .limit(remaining);
        products = [...products, ...additionalProducts];
      }
    } else {
      // For non-authenticated users, return popular products
      products = await Product.find({ isActive: true })
        .sort({ 'ratings.average': -1, createdAt: -1 })
        .limit(limit);
    }

    // Format image URLs
    const formattedProducts = products.map(product => {
      const productObj = product.toObject();
      
      // Format single image field
      if (productObj.image) {
        productObj.image = `${req.protocol}://${req.get('host')}/uploads/${productObj.image}`;
      }
      
      // Format images array
      if (productObj.images && Array.isArray(productObj.images)) {
        productObj.images = productObj.images.map(img => ({
          ...img,
          url: img.url && !img.url.startsWith('http') 
            ? `${req.protocol}://${req.get('host')}/uploads/${img.url}`
            : img.url
        }));
      }
      
      return productObj;
    });

    res.json({
      success: true,
      data: formattedProducts
    });
  } catch (error) {
    next(error);
  }
};

