# Azure Portal Deployment Guide

Since we're encountering issues with the CLI deployment, here's a step-by-step guide to deploy through the Azure Portal:

## 1. Prepare Your Deployment Package

We've already created a deployment package (`deploy-startup.zip`) with all the necessary files.

## 2. Log in to Azure Portal

1. Go to [https://portal.azure.com](https://portal.azure.com)
2. Sign in with your Microsoft account

## 3. Navigate to Your Web App

1. Search for "App Services" in the search bar at the top
2. Find and select "rr-aihome" from the list

## 4. Deploy Using the Azure Portal

1. In the left menu, scroll down to "Deployment" section
2. Click on "Deployment Center"
3. Select "Manual deployment" > "ZIP Deploy"
4. Click "Browse" and select your `deploy-startup.zip` file
5. Click "Upload" to deploy your application

## 5. Configure App Settings (Environment Variables)

1. In your web app, go to "Settings" > "Configuration"
2. Add the following Application settings (if they don't already exist):
   - AZURE_OPENAI_ENDPOINT: https://generalsearchai.openai.azure.com/
   - AZURE_OPENAI_API_KEY: (your API key)
   - AZURE_OPENAI_DEPLOYMENT: gpt-4.1
   - AZURE_OPENAI_API_VERSION: 2025-01-01-preview
3. Click "Save"

## 6. Install Dependencies Using Kudu Console

1. In your web app, go to "Development Tools" > "Advanced Tools" > "Go"
2. This will open the Kudu service in a new tab
3. Click on "Debug console" > "CMD" or "PowerShell"
4. Navigate to the site/wwwroot directory
5. Run the following commands:
   ```
   npm install
   ```

## 7. Restart the Web App

1. Go back to your web app in the Azure Portal
2. Click "Restart" at the top of the Overview page
3. Wait for the app to restart

## 8. Check the Application

1. Once restarted, click on the URL (https://rr-aihome.azurewebsites.net)
2. Your application should now be running

## Troubleshooting

If you're still encountering issues:

1. Check the logs in the Azure Portal:
   - Go to "Monitoring" > "Log stream"
   - This will show you real-time logs from your application

2. Check the Kudu console for more detailed logs:
   - Go to "Development Tools" > "Advanced Tools" > "Go"
   - Navigate to "LogFiles" directory to view detailed logs
