#!/bin/bash

# ----------------------
# Azure App Service Deployment Script for Linux
# ----------------------

# Stop on errors and print commands as they're executed
set -e
set -x

echo "========== Deployment script started =========="

# 1. Setup environment variables
echo "Setting up environment variables"
DEPLOYMENT_SOURCE="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
if [[ -z "$DEPLOYMENT_TARGET" ]]; then
  DEPLOYMENT_TARGET="$DEPLOYMENT_SOURCE"
fi

echo "Deployment source: $DEPLOYMENT_SOURCE"
echo "Deployment target: $DEPLOYMENT_TARGET"

# 2. Install dependencies
if [ -e "$DEPLOYMENT_TARGET/package.json" ]; then
  echo "Installing npm packages..."
  cd "$DEPLOYMENT_TARGET"
  
  # Skip npm update as it requires Node.js 20+
  echo "Using existing npm version: $(npm -v)"
  
  # Install dependencies
  echo "Running npm install --production"
  npm install --production
  
  # Print installed packages for debugging
  echo "Listing installed packages:"
  npm list --depth=0
else
  echo "WARNING: package.json not found in $DEPLOYMENT_TARGET"
fi

# 3. Print diagnostic information
# 3. Ensure static assets are copied
echo "========== Copying static assets =========="

# Ensure images directory exists
if [ -d "$DEPLOYMENT_SOURCE/images" ]; then
  echo "Images directory found in source. Ensuring it exists in target..."
  mkdir -p "$DEPLOYMENT_TARGET/images"
  
  # Copy all image files
  echo "Copying image files..."
  cp -rf "$DEPLOYMENT_SOURCE/images"/* "$DEPLOYMENT_TARGET/images/"
  
  # List copied files
  echo "Images directory contents:"
  ls -la "$DEPLOYMENT_TARGET/images"
else
  echo "WARNING: Images directory not found in source: $DEPLOYMENT_SOURCE/images"
  # Try to find where images might be
  echo "Searching for images directory..."
  find "$DEPLOYMENT_SOURCE" -type d -name "images" -print
fi

echo "========== Deployment Diagnostics =========="
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la
echo "Environment variables:"
printenv | grep -v -E "(PASSWORD|KEY|SECRET|TOKEN)"

echo "========== Deployment script completed successfully =========="

# 3. Start the application
echo "Starting application..."
echo "Deployment completed successfully!"
