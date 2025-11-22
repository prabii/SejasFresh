#!/usr/bin/env node

/**
 * Script to help set up images exported from Figma
 * 
 * Usage:
 * 1. Export images from Figma to a folder
 * 2. Run: node scripts/setup-figma-images.js <path-to-exported-images>
 * 
 * Example:
 * node scripts/setup-figma-images.js ~/Downloads/figma-exports
 */

const fs = require('fs');
const path = require('path');

const sourceDir = process.argv[2];
const targetDir = path.join(__dirname, '../assets/images/products');

if (!sourceDir) {
  console.log('❌ Please provide the path to exported Figma images');
  console.log('Usage: node scripts/setup-figma-images.js <path-to-images>');
  process.exit(1);
}

if (!fs.existsSync(sourceDir)) {
  console.log(`❌ Directory not found: ${sourceDir}`);
  process.exit(1);
}

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`✅ Created directory: ${targetDir}`);
}

// Get all image files from source
const files = fs.readdirSync(sourceDir).filter(file => {
  const ext = path.extname(file).toLowerCase();
  return ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);
});

if (files.length === 0) {
  console.log('❌ No image files found in source directory');
  process.exit(1);
}

console.log(`\n📸 Found ${files.length} image(s) to copy:\n`);

// Copy files
let copied = 0;
files.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const targetPath = path.join(targetDir, file);
  
  try {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✅ Copied: ${file}`);
    copied++;
  } catch (error) {
    console.log(`❌ Failed to copy ${file}: ${error.message}`);
  }
});

console.log(`\n✨ Done! Copied ${copied}/${files.length} images`);
console.log(`📁 Images are now in: ${targetDir}`);
console.log('\n💡 Tip: Restart Expo with --clear to see new images:');
console.log('   npx expo start --clear\n');

