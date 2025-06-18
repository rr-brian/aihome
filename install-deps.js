// install-deps.js - Script to install dependencies if they're missing
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Checking for dependencies...');

try {
  // Check if node_modules exists
  if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
    console.log('node_modules directory not found. Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('Dependencies installed successfully.');
  } else {
    // Check specifically for openai module
    try {
      require.resolve('openai');
      console.log('openai module found.');
    } catch (err) {
      console.log('openai module not found. Installing dependencies...');
      execSync('npm install', { stdio: 'inherit' });
      console.log('Dependencies installed successfully.');
    }
  }
} catch (error) {
  console.error('Error installing dependencies:', error);
}

// Export a function that can be called from other scripts
module.exports = {
  ensureDependencies: function() {
    try {
      require.resolve('openai');
      return true;
    } catch (err) {
      console.log('openai module not found. Please install dependencies.');
      return false;
    }
  }
};
