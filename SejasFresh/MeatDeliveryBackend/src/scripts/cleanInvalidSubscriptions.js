require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meat-delivery', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');
  cleanInvalidSubscriptions();
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function cleanInvalidSubscriptions() {
  try {
    console.log('🧹 Cleaning invalid push subscriptions...\n');
    
    // Find all users with push subscriptions
    const users = await User.find({ 
      pushSubscription: { $ne: null } 
    }).select('_id email firstName pushSubscription pushToken role');
    
    console.log(`Found ${users.length} users with push subscriptions\n`);
    
    let cleaned = 0;
    let kept = 0;
    
    for (const user of users) {
      // Check if user has old fake web token
      if (user.pushToken && user.pushToken.startsWith('web_')) {
        console.log(`Cleaning user ${user._id} (${user.email || user.firstName}):`);
        console.log(`  - Removing fake web token: ${user.pushToken}`);
        user.pushToken = null;
        cleaned++;
      }
      
      // Keep pushSubscription for now - it will be cleaned on next send attempt if invalid
      if (user.pushSubscription) {
        kept++;
      }
      
      await user.save();
    }
    
    console.log(`\n✅ Cleanup complete:`);
    console.log(`   - Cleaned ${cleaned} fake web tokens`);
    console.log(`   - Kept ${kept} push subscriptions (will be validated on next send)`);
    console.log(`\n💡 Users will automatically re-subscribe on next login if subscription is invalid.`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning subscriptions:', error);
    process.exit(1);
  }
}

