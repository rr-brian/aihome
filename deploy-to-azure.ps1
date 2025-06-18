# Azure deployment script for RTS AI Assist
# This script deploys the application to Azure App Service

# Variables
$resourceGroup = "rts_innovate"
$appName = "rr-aihome"
$location = "eastus"  # Change if needed
$appServicePlanName = "rts-app-plan"  # You can change this name if needed
$sku = "B1"  # Basic tier, you can change to S1, P1V2, etc. based on your needs

Write-Host "Starting deployment to Azure App Service..." -ForegroundColor Green

# Check if app service plan exists, create if it doesn't
$planExists = az appservice plan list --resource-group $resourceGroup --query "[?name=='$appServicePlanName']" --output tsv
if (!$planExists) {
    Write-Host "Creating App Service Plan: $appServicePlanName..." -ForegroundColor Yellow
    az appservice plan create --name $appServicePlanName --resource-group $resourceGroup --sku $sku --is-linux
}

# Check if web app exists, create if it doesn't
$webAppExists = az webapp list --resource-group $resourceGroup --query "[?name=='$appName']" --output tsv
if (!$webAppExists) {
    Write-Host "Creating Web App: $appName..." -ForegroundColor Yellow
    az webapp create --name $appName --resource-group $resourceGroup --plan $appServicePlanName --runtime "NODE|18-lts"
}

# Configure app settings (environment variables)
Write-Host "Configuring environment variables..." -ForegroundColor Yellow
az webapp config appsettings set --name $appName --resource-group $resourceGroup --settings AZURE_OPENAI_ENDPOINT="$env:AZURE_OPENAI_ENDPOINT" AZURE_OPENAI_DEPLOYMENT="$env:AZURE_OPENAI_DEPLOYMENT" AZURE_OPENAI_API_VERSION="$env:AZURE_OPENAI_API_VERSION"

# For the API key, we'll set it separately for security
Write-Host "Setting API key as an app setting..." -ForegroundColor Yellow
az webapp config appsettings set --name $appName --resource-group $resourceGroup --settings AZURE_OPENAI_API_KEY="$env:AZURE_OPENAI_API_KEY"

# Deploy the application using ZIP deployment
Write-Host "Preparing application for deployment..." -ForegroundColor Yellow
Compress-Archive -Path * -DestinationPath ./deploy.zip -Force

Write-Host "Deploying application to Azure..." -ForegroundColor Green
az webapp deployment source config-zip --resource-group $resourceGroup --name $appName --src ./deploy.zip

# Clean up the zip file
Remove-Item -Path ./deploy.zip -Force

Write-Host "Deployment completed!" -ForegroundColor Green
Write-Host "Your application is now available at: https://$appName.azurewebsites.net" -ForegroundColor Cyan
