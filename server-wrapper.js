// server-wrapper.js - Ensures dependencies are installed before starting the server
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting server wrapper...');

// Check if node_modules exists and contains openai
const openaiPath = path.join(__dirname, 'node_modules', 'openai');
if (!fs.existsSync(openaiPath)) {
  console.log('OpenAI module not found. Installing dependencies...');
  try {
    // Run npm install
    execSync('npm install', { stdio: 'inherit' });
    console.log('Dependencies installed successfully.');
  } catch (error) {
    console.error('Failed to install dependencies:', error);
    process.exit(1);
  }
} else {
  console.log('Dependencies already installed.');
}

// Start the server
console.log('Starting server...');
require('./server.js');
