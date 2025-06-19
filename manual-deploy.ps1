# Manual deployment script for Azure App Service
# This script creates a zip package and deploys it directly to Azure

# Variables
$resourceGroup = "rts_innovate"
$appName = "rr-aihome"
$zipFile = ".\manual-deploy.zip"

Write-Host "Starting manual deployment to Azure App Service..." -ForegroundColor Green

# Create deployment package
Write-Host "Creating deployment package..." -ForegroundColor Yellow
if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
}

# Add timestamp to script.js for cache busting
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$scriptContent = Get-Content -Path ".\script.js" -Raw
$scriptContent = $scriptContent -replace "Hello! I'm an AI assistant powered by Realty Technology Services and OpenAI. How can I help you today\?(.*)", "Hello! I'm an AI assistant powered by Realty Technology Services and OpenAI. How can I help you today? (Manual deployment: $timestamp)"
Set-Content -Path ".\script.js" -Value $scriptContent

# Create the zip file
Write-Host "Creating zip file with all content..." -ForegroundColor Yellow
Compress-Archive -Path * -DestinationPath $zipFile -Force

# Deploy to Azure
Write-Host "Deploying to Azure App Service..." -ForegroundColor Green
az webapp deployment source config-zip --resource-group $resourceGroup --name $appName --src $zipFile

# Clean up
Write-Host "Cleaning up..." -ForegroundColor Yellow
Remove-Item $zipFile -Force

Write-Host "Manual deployment completed!" -ForegroundColor Green
Write-Host "Your application should now be available at: https://www.rrrealty.ai" -ForegroundColor Cyan
Write-Host "Note: It may take a few minutes for the changes to propagate." -ForegroundColor Yellow
