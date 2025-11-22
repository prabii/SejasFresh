require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createDeliveryUser = async () => {
  try {
    // Get user input from command line arguments
    const args = process.argv.slice(2);
    
    if (args.length < 3) {
      console.log('Usage: node createDeliveryUser.js <firstName> <email> <password> [phone]');
      console.log('Example: node createDeliveryUser.js "John" "john@delivery.com" "password123" "+1234567890"');
      process.exit(1);
    }

    const [firstName, email, password, phone] = args;

    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://20nu1a0562_db_user:xgOca0pBsUnzUAHL@meatdelivery.btrqws6.mongodb.net/meatdelivery?retryWrites=true&w=majority';
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: email },
        { phone: phone || 'not-provided' }
      ]
    });

    if (existingUser) {
      console.log('⚠️  User already exists!');
      console.log('Email:', existingUser.email);
      console.log('Phone:', existingUser.phone);
      process.exit(1);
    }

    // Create delivery user
    const deliveryUserData = {
      firstName: firstName,
      lastName: 'Delivery',
      email: email,
      password: password,
      phone: phone || `+1${Math.floor(Math.random() * 10000000000)}`,
      role: 'delivery',
      isActive: true,
      emailVerified: true,
      phoneVerified: true
    };

    const deliveryUser = await User.create(deliveryUserData);

    console.log('✅ Delivery user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Name:', deliveryUser.firstName, deliveryUser.lastName);
    console.log('📧 Email:', deliveryUser.email);
    console.log('📱 Phone:', deliveryUser.phone);
    console.log('🔑 Password:', password);
    console.log('👷 Role:', deliveryUser.role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ User can now login to the delivery app!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating delivery user:', error.message);
    process.exit(1);
  }
};

createDeliveryUser();

