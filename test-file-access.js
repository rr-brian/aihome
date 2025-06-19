// Simple script to test file access
const fs = require('fs');
const path = require('path');

// Try to access the logo file
const logoPath = path.join(__dirname, 'images', 'logo.png');

console.log('Checking if logo file exists at:', logoPath);

try {
  const stats = fs.statSync(logoPath);
  console.log('File exists!');
  console.log('File size:', stats.size, 'bytes');
  console.log('File permissions:', stats.mode.toString(8));
} catch (error) {
  console.error('Error accessing file:', error.message);
}

// List all files in the images directory
console.log('\nListing all files in the images directory:');
try {
  const imagesDir = path.join(__dirname, 'images');
  const files = fs.readdirSync(imagesDir);
  
  if (files.length === 0) {
    console.log('No files found in the images directory');
  } else {
    files.forEach(file => {
      const filePath = path.join(imagesDir, file);
      const stats = fs.statSync(filePath);
      console.log(`- ${file} (${stats.size} bytes)`);
    });
  }
} catch (error) {
  console.error('Error listing directory:', error.message);
}
