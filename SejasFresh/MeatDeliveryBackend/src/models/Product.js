const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide product description']
  },
  price: {
    type: Number,
    required: [true, 'Please provide product price'],
    min: 0
  },
  discountedPrice: {
    type: Number,
    min: 0
  },
  image: {
    type: String,
    default: null
  },
  images: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    }
  }],
  category: {
    type: String,
    enum: ['premium', 'normal', 'exclusive'],
    required: [true, 'Please provide category']
  },
  subcategory: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  deliveryTime: {
    type: String,
    default: '60-90 minutes'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  availability: {
    inStock: {
      type: Boolean,
      default: true
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  weight: {
    value: {
      type: Number,
      default: 1
    },
    unit: {
      type: String,
      enum: ['kg', 'g', 'lb'],
      default: 'kg'
    }
  },
  discount: {
    percentage: {
      type: Number,
      min: 0,
      max: 100
    },
    validUntil: {
      type: Date
    }
  },
  preparationMethod: {
    type: String,
    default: 'Fresh'
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Product', productSchema);

