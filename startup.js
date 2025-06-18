// startup.js - Helper script for Azure App Service
const { spawn } = require('child_process');
const path = require('path');

// Log startup information
console.log('Starting application in Azure App Service...');
console.log(`Current directory: ${process.cwd()}`);
console.log(`Node version: ${process.version}`);
console.log('Environment variables (non-sensitive):');
Object.keys(process.env)
  .filter(key => !key.includes('KEY') && !key.includes('SECRET') && !key.includes('PASSWORD'))
  .forEach(key => console.log(`${key}: ${process.env[key]}`));

// Start the main server.js application
const server = spawn('node', ['server.js'], { stdio: 'inherit' });

server.on('close', (code) => {
  console.log(`Child process exited with code ${code}`);
  process.exit(code);
});

process.on('SIGINT', () => {
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  server.kill('SIGTERM');
});
