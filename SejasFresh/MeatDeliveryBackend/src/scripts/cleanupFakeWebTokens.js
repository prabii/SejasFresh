require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meat-delivery', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');
  cleanupFakeTokens();
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function cleanupFakeTokens() {
  try {
    console.log('🧹 Cleaning up fake web tokens and invalid subscriptions...\n');
    
    // Find all users with fake web tokens
    const usersWithFakeTokens = await User.find({ 
      pushToken: { $regex: /^web_/ }
    }).select('_id email firstName pushToken pushSubscription role');
    
    console.log(`Found ${usersWithFakeTokens.length} users with fake web tokens\n`);
    
    let cleaned = 0;
    let subscriptionsRemoved = 0;
    
    for (const user of usersWithFakeTokens) {
      console.log(`Cleaning user ${user._id} (${user.email || user.firstName || user.role}):`);
      
      let updated = false;
      
      // Remove fake web token
      if (user.pushToken && user.pushToken.startsWith('web_')) {
        console.log(`  - Removing fake web token: ${user.pushToken.substring(0, 30)}...`);
        user.pushToken = null;
        cleaned++;
        updated = true;
      }
      
      // Also remove invalid subscriptions (they'll need to re-subscribe with correct VAPID keys)
      if (user.pushSubscription) {
        console.log(`  - Removing invalid subscription (will re-subscribe with correct keys)`);
        user.pushSubscription = null;
        subscriptionsRemoved++;
        updated = true;
      }
      
      if (updated) {
        await user.save();
        console.log(`  ✅ User cleaned\n`);
      }
    }
    
    // Also find users with invalid subscriptions but no fake tokens
    const usersWithSubscriptions = await User.find({ 
      pushSubscription: { $ne: null },
      pushToken: { $not: { $regex: /^web_/ } }
    }).select('_id email firstName pushSubscription role');
    
    console.log(`\nFound ${usersWithSubscriptions.length} users with subscriptions (these are OK if VAPID keys match)\n`);
    
    console.log(`\n✅ Cleanup complete:`);
    console.log(`   - Cleaned ${cleaned} fake web tokens`);
    console.log(`   - Removed ${subscriptionsRemoved} invalid subscriptions`);
    console.log(`\n💡 Users will automatically re-subscribe on next login with correct VAPID keys.`);
    console.log(`💡 Make sure VAPID keys match between frontend (.env) and backend (Render env vars).`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning tokens:', error);
    process.exit(1);
  }
}

