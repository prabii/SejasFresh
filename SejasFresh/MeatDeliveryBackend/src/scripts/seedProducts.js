require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');

// Map product names to actual image file names
const getImageFileName = (productName) => {
  const lowerName = productName.toLowerCase();
  
  // Premium Cuts
  if (lowerName.includes('tenderloin') || lowerName.includes('tender')) {
    return 'Tenderloin.jpg';
  }
  if (lowerName.includes('ribeye') || lowerName.includes('rib eye')) {
    return 'Ribeye.jpg';
  }
  if (lowerName.includes('shank')) {
    return 'shank.jpeg';
  }
  if (lowerName.includes('brisket')) {
    return 'Beef-brisket.jpg';
  }
  if (lowerName.includes('chuck') && !lowerName.includes('ground')) {
    return 'ground-chuck.jpg';
  }
  if (lowerName.includes('loin') && !lowerName.includes('short') && !lowerName.includes('long')) {
    return 'short loin.jpeg';
  }
  
  // Normal Products
  if (lowerName.includes('boti')) {
    return 'Boti.jpg';
  }
  if (lowerName.includes('short rib')) {
    return 'short ribs.jpeg';
  }
  if (lowerName.includes('ground chuck') || lowerName.includes('ground')) {
    return 'ground-chuck.jpg';
  }
  if (lowerName.includes('flank')) {
    return 'Flank Steak.jpeg';
  }
  if (lowerName.includes('skirt')) {
    return 'Skirt steak.jpeg';
  }
  if (lowerName.includes('top round')) {
    return 'top round.jpeg';
  }
  if (lowerName.includes('bottom round')) {
    return 'bottom round.jpeg';
  }
  if (lowerName.includes('short loin')) {
    return 'short loin.jpeg';
  }
  if (lowerName.includes('long loin')) {
    return 'long loin.jpeg';
  }
  if (lowerName.includes('rib roast')) {
    return 'rib roast.jpg';
  }
  if (lowerName.includes('rump roast')) {
    return 'rump roast.jpg';
  }
  if (lowerName.includes('shoulder')) {
    return 'shoulder steak.jpeg';
  }
  if (lowerName.includes('liver') || lowerName.includes('buffalo liver')) {
    return 'Liver.jpg';
  }
  if (lowerName.includes('buffalo brain') || lowerName.includes('brain')) {
    return 'Liver.jpg'; // Using liver as placeholder
  }
  if (lowerName.includes('heart')) {
    return 'heart.jpg';
  }
  if (lowerName.includes('kidney')) {
    return 'kidney.jpeg';
  }
  if (lowerName.includes('tripe')) {
    return 'Tripe.jpeg';
  }
  if (lowerName.includes('tongue')) {
    return 'Toungue.jpeg';
  }
  if (lowerName.includes('back rib')) {
    return 'back ribs.jpg';
  }
  if (lowerName === 'beef') {
    return 'Beef-brisket.jpg';
  }
  
  // Default fallback
  return 'Beef-brisket.jpg';
};

// Products from mockData.ts
const products = [
  // Premium Cuts
  {
    name: 'Loin',
    description: 'Premium loin cut, tender and flavorful. Perfect for special occasions.',
    price: 1500,
    discountedPrice: 1200,
    category: 'premium',
    subcategory: 'steak',
    rating: 4.8,
    ratings: { average: 4.8, count: 150 },
    deliveryTime: 'Next day by 6:00 AM',
    isActive: true,
    availability: { inStock: true, quantity: 25 },
    weight: { value: 1, unit: 'kg' },
    discount: { percentage: 20, validUntil: new Date('2024-12-31') },
    preparationMethod: 'Fresh',
    tags: ['premium', 'fresh', 'organic', 'tender']
  },
  {
    name: 'Shank',
    description: 'Premium shank cut, perfect for slow cooking and braising.',
    price: 1400,
    discountedPrice: 1100,
    category: 'premium',
    subcategory: 'roast',
    rating: 4.7,
    ratings: { average: 4.7, count: 120 },
    deliveryTime: 'Next day by 6:00 AM',
    isActive: true,
    availability: { inStock: true, quantity: 30 },
    weight: { value: 1, unit: 'kg' },
    discount: { percentage: 21, validUntil: new Date('2024-12-31') },
    preparationMethod: 'Fresh',
    tags: ['premium', 'braising', 'slow-cook']
  },
  {
    name: 'Brisket',
    description: 'Premium brisket cut, ideal for smoking and BBQ.',
    price: 1300,
    discountedPrice: 1050,
    category: 'premium',
    subcategory: 'roast',
    rating: 4.6,
    ratings: { average: 4.6, count: 180 },
    deliveryTime: 'Next day by 6:00 AM',
    isActive: true,
    availability: { inStock: true, quantity: 20 },
    weight: { value: 1, unit: 'kg' },
    discount: { percentage: 19, validUntil: new Date('2024-12-31') },
    preparationMethod: 'Fresh',
    tags: ['premium', 'bbq', 'smoking']
  },
  {
    name: 'Chuck',
    description: 'Premium chuck cut, great for pot roasts and stews.',
    price: 1200,
    discountedPrice: 1000,
    category: 'premium',
    subcategory: 'roast',
    rating: 4.5,
    ratings: { average: 4.5, count: 160 },
    deliveryTime: 'Next day by 6:00 AM',
    isActive: true,
    availability: { inStock: true, quantity: 35 },
    weight: { value: 1, unit: 'kg' },
    discount: { percentage: 17, validUntil: new Date('2024-12-31') },
    preparationMethod: 'Fresh',
    tags: ['premium', 'stew', 'pot-roast']
  },
  {
    name: 'Tenderloin',
    description: 'Premium tenderloin cut, the most tender part of beef. Perfect for special occasions.',
    price: 1500,
    discountedPrice: 1200,
    category: 'premium',
    subcategory: 'steak',
    rating: 4.8,
    ratings: { average: 4.8, count: 150 },
    deliveryTime: 'Next day by 6:00 AM',
    isActive: true,
    availability: { inStock: true, quantity: 25 },
    weight: { value: 1, unit: 'kg' },
    discount: { percentage: 20, validUntil: new Date('2024-12-31') },
    preparationMethod: 'Fresh',
    tags: ['premium', 'fresh', 'organic', 'tender']
  },
  {
    name: 'Ribeye Steak',
    description: 'Well-marbled ribeye steak with rich flavor. Great for grilling.',
    price: 1400,
    discountedPrice: 1100,
    category: 'premium',
    subcategory: 'steak',
    rating: 4.7,
    ratings: { average: 4.7, count: 120 },
    deliveryTime: 'Next day by 6:00 AM',
    isActive: true,
    availability: { inStock: true, quantity: 30 },
    weight: { value: 1, unit: 'kg' },
    discount: { percentage: 21, validUntil: new Date('2024-12-31') },
    preparationMethod: 'Fresh',
    tags: ['premium', 'marbled', 'grilling']
  },
  // Instant Deliverables - Normal category
  {
    name: 'Beef',
    description: 'Fresh premium beef, perfect for any recipe. Delivered within 30 minutes.',
    price: 400,
    discountedPrice: 400,
    category: 'normal',
    subcategory: 'beef',
    rating: 4.8,
    ratings: { average: 4.8, count: 250 },
    deliveryTime: '30 min',
    isActive: true,
    availability: { inStock: true, quantity: 100 },
    weight: { value: 1, unit: 'kg' },
    preparationMethod: 'Fresh',
    tags: ['fresh', 'instant', 'beef']
  },
  {
    name: 'Buffalo Liver',
    description: 'Fresh buffalo liver, rich in nutrients. Delivered within 30 minutes.',
    price: 400,
    discountedPrice: 400,
    category: 'normal',
    subcategory: 'organ',
    rating: 4.8,
    ratings: { average: 4.8, count: 150 },
    deliveryTime: '30 min',
    isActive: true,
    availability: { inStock: true, quantity: 60 },
    weight: { value: 1, unit: 'kg' },
    preparationMethod: 'Fresh',
    tags: ['fresh', 'instant', 'organ', 'liver']
  },
  {
    name: 'Buffalo Brain',
    description: 'Fresh buffalo brain, delicacy meat. Delivered within 30 minutes.',
    price: 400,
    discountedPrice: 400,
    category: 'normal',
    subcategory: 'organ',
    rating: 4.8,
    ratings: { average: 4.8, count: 120 },
    deliveryTime: '30 min',
    isActive: true,
    availability: { inStock: true, quantity: 40 },
    weight: { value: 1, unit: 'kg' },
    preparationMethod: 'Fresh',
    tags: ['fresh', 'instant', 'organ', 'brain']
  },
  // Normal Products
  {
    name: 'Boti',
    description: 'Traditional boti cut, perfect for kebabs and curries.',
    price: 800,
    discountedPrice: 650,
    category: 'normal',
    subcategory: 'curry',
    rating: 4.5,
    ratings: { average: 4.5, count: 200 },
    deliveryTime: '60-90 minutes',
    isActive: true,
    availability: { inStock: true, quantity: 50 },
    weight: { value: 1, unit: 'kg' },
    discount: { percentage: 19, validUntil: new Date('2024-12-31') },
    preparationMethod: 'Fresh',
    tags: ['traditional', 'curry', 'kebab']
  },
  {
    name: 'Beef Brisket',
    description: 'Slow-cooked brisket, tender and flavorful. Perfect for BBQ.',
    price: 900,
    discountedPrice: 750,
    category: 'normal',
    subcategory: 'roast',
    rating: 4.6,
    ratings: { average: 4.6, count: 180 },
    deliveryTime: '60-90 minutes',
    isActive: true,
    availability: { inStock: true, quantity: 40 },
    weight: { value: 1, unit: 'kg' },
    discount: { percentage: 17, validUntil: new Date('2024-12-31') },
    preparationMethod: 'Fresh',
    tags: ['bbq', 'slow-cooked', 'tender']
  },
  {
    name: 'Short Ribs',
    description: 'Meaty short ribs, great for braising and slow cooking.',
    price: 850,
    discountedPrice: 700,
    category: 'normal',
    subcategory: 'ribs',
    rating: 4.4,
    ratings: { average: 4.4, count: 160 },
    deliveryTime: '60-90 minutes',
    isActive: true,
    availability: { inStock: true, quantity: 35 },
    weight: { value: 1, unit: 'kg' },
    discount: { percentage: 18, validUntil: new Date('2024-12-31') },
    preparationMethod: 'Fresh',
    tags: ['ribs', 'braising', 'meaty']
  },
  {
    name: 'Ground Chuck',
    description: 'Fresh ground chuck, perfect for burgers and meatballs.',
    price: 600,
    discountedPrice: 500,
    category: 'normal',
    subcategory: 'ground',
    rating: 4.3,
    ratings: { average: 4.3, count: 250 },
    deliveryTime: '60-90 minutes',
    isActive: true,
    availability: { inStock: true, quantity: 60 },
    weight: { value: 1, unit: 'kg' },
    discount: { percentage: 17, validUntil: new Date('2024-12-31') },
    preparationMethod: 'Fresh',
    tags: ['ground', 'burgers', 'versatile']
  },
  {
    name: 'Flank Steak',
    description: 'Lean flank steak, great for stir-fries and fajitas.',
    price: 950,
    discountedPrice: 800,
    category: 'normal',
    subcategory: 'steak',
    rating: 4.2,
    ratings: { average: 4.2, count: 140 },
    deliveryTime: '60-90 minutes',
    isActive: true,
    availability: { inStock: true, quantity: 28 },
    weight: { value: 1, unit: 'kg' },
    discount: { percentage: 16, validUntil: new Date('2024-12-31') },
    preparationMethod: 'Fresh',
    tags: ['lean', 'stir-fry', 'fajitas']
  },
  {
    name: 'Skirt Steak',
    description: 'Flavorful skirt steak, perfect for grilling and marinating.',
    price: 880,
    discountedPrice: 720,
    category: 'normal',
    subcategory: 'steak',
    rating: 4.1,
    ratings: { average: 4.1, count: 130 },
    deliveryTime: '60-90 minutes',
    isActive: true,
    availability: { inStock: true, quantity: 32 },
    weight: { value: 1, unit: 'kg' },
    discount: { percentage: 18, validUntil: new Date('2024-12-31') },
    preparationMethod: 'Fresh',
    tags: ['flavorful', 'grilling', 'marinating']
  }
];

const seedProducts = async () => {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://20nu1a0562_db_user:xgOca0pBsUnzUAHL@meatdelivery.btrqws6.mongodb.net/meatdelivery?retryWrites=true&w=majority';
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing products (optional - comment out if you want to keep existing)
    // await Product.deleteMany({});
    // console.log('🗑️  Cleared existing products');

    // Add images to each product
    const productsWithImages = products.map(product => {
      const imageFileName = getImageFileName(product.name);
      return {
        ...product,
        image: imageFileName,
        images: [{
          url: imageFileName,
          alt: product.name
        }]
      };
    });

    // Insert products
    let created = 0;
    let skipped = 0;

    for (const productData of productsWithImages) {
      const existing = await Product.findOne({ name: productData.name });
      if (existing) {
        console.log(`⏭️  Skipped: ${productData.name} (already exists)`);
        skipped++;
      } else {
        await Product.create(productData);
        console.log(`✅ Created: ${productData.name}`);
        created++;
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Seeding complete!`);
    console.log(`   Created: ${created} products`);
    console.log(`   Skipped: ${skipped} products (already exist)`);
    console.log(`   Total: ${products.length} products`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();

