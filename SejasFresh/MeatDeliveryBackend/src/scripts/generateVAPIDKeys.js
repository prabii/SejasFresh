require('dotenv').config();
const webpush = require('web-push');

console.log('🔑 Generating VAPID Keys for Web Push Notifications...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ VAPID Keys Generated Successfully!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📋 Add these to your environment variables:\n');
console.log('Backend (.env or Render Environment Variables):');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:admin@sejas.com\n`);

console.log('Frontend (MeatDeliveryAdmin/.env or Vercel Environment Variables):');
console.log(`VITE_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}\n`);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('⚠️  IMPORTANT:');
console.log('1. Keep VAPID_PRIVATE_KEY secret (backend only)');
console.log('2. VAPID_PUBLIC_KEY is safe to expose (frontend)');
console.log('3. Add these to Render and Vercel environment variables');
console.log('4. Restart backend after adding environment variables');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

