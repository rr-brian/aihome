#!/bin/bash

# ----------------------
# Azure App Service Deployment Script
# ----------------------

# Stop on errors
set -e

# 1. Install dependencies
echo "Installing dependencies..."
npm install

# 2. Log environment for debugging
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# 3. Start the application
echo "Starting application..."
echo "Deployment completed successfully!"
