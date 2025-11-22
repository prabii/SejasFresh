/**
 * Helper script to format .env file for Render deployment
 * This reads your .env file and formats it for easy copy-paste into Render dashboard
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  console.log('📝 Please make sure your .env file exists in the backend directory.');
  process.exit(1);
}

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse environment variables
const envVars = {};
const lines = envContent.split('\n');

lines.forEach((line, index) => {
  // Skip comments and empty lines
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) {
    return;
  }

  // Parse KEY=VALUE format
  const equalIndex = trimmed.indexOf('=');
  if (equalIndex === -1) {
    return;
  }

  const key = trimmed.substring(0, equalIndex).trim();
  const value = trimmed.substring(equalIndex + 1).trim();
  
  // Remove quotes if present
  const cleanValue = value.replace(/^["']|["']$/g, '');
  
  if (key) {
    envVars[key] = cleanValue;
  }
});

// Display formatted output
console.log('\n📋 Environment Variables for Render Dashboard:\n');
console.log('='.repeat(60));
console.log('Copy and paste these into Render Environment Variables:\n');

Object.entries(envVars).forEach(([key, value]) => {
  console.log(`Key: ${key}`);
  console.log(`Value: ${value}`);
  console.log('---');
});

console.log('\n' + '='.repeat(60));
console.log('\n✅ Total variables: ' + Object.keys(envVars).length);
console.log('\n📝 Instructions:');
console.log('1. Go to Render Dashboard → Your Service → Environment');
console.log('2. Click "Add Environment Variable" for each variable above');
console.log('3. Copy the Key and Value pairs shown above');
console.log('\n');

