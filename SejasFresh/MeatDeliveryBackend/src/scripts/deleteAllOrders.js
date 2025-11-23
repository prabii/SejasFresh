require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../models/Order');

const deleteAllOrders = async () => {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://20nu1a0562_db_user:xgOca0pBsUnzUAHL@meatdelivery.btrqws6.mongodb.net/meatdelivery?retryWrites=true&w=majority';
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Count orders before deletion
    const orderCount = await Order.countDocuments();
    console.log(`📊 Found ${orderCount} orders in database`);

    if (orderCount === 0) {
      console.log('⚠️  No orders to delete');
      process.exit(0);
    }

    // Delete all orders
    const result = await Order.deleteMany({});
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Successfully deleted ${result.deletedCount} orders`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Verify deletion
    const remainingOrders = await Order.countDocuments();
    console.log(`📊 Remaining orders: ${remainingOrders}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting orders:', error);
    process.exit(1);
  }
};

deleteAllOrders();

