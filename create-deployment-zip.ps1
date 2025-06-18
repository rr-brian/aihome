# PowerShell script to create a deployment package with node_modules
Write-Host "Creating deployment package with node_modules..." -ForegroundColor Green

# Check if the zip file already exists and delete it
if (Test-Path -Path ".\deploy-full.zip") {
    Remove-Item -Path ".\deploy-full.zip" -Force
}

# Create a temporary directory for the files
$tempDir = ".\temp-deploy"
if (Test-Path -Path $tempDir) {
    Remove-Item -Path $tempDir -Recurse -Force
}
New-Item -Path $tempDir -ItemType Directory | Out-Null

# Copy all files to the temporary directory
Write-Host "Copying files to temporary directory..." -ForegroundColor Yellow
Copy-Item -Path ".\*" -Destination $tempDir -Recurse -Exclude "*.zip", "temp-deploy"

# Create the ZIP file
Write-Host "Creating ZIP file..." -ForegroundColor Yellow
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, "$(Get-Location)\deploy-full.zip")

# Clean up
Write-Host "Cleaning up..." -ForegroundColor Yellow
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "Deployment package created: deploy-full.zip" -ForegroundColor Green
Write-Host "File size: $((Get-Item .\deploy-full.zip).Length) bytes" -ForegroundColor Cyan
