# PowerShell script to create a deployment package without node_modules
Write-Host "Creating deployment package..." -ForegroundColor Green

# Check if the zip file already exists and delete it
if (Test-Path -Path ".\deploy-startup.zip") {
    Remove-Item -Path ".\deploy-startup.zip" -Force
}

# Create a temporary directory for the files
$tempDir = ".\temp-deploy"
if (Test-Path -Path $tempDir) {
    Remove-Item -Path $tempDir -Recurse -Force
}
New-Item -Path $tempDir -ItemType Directory | Out-Null

# Copy all files to the temporary directory except node_modules and zip files
Write-Host "Copying files to temporary directory..." -ForegroundColor Yellow
Get-ChildItem -Path "." -Exclude "node_modules", "*.zip", "temp-deploy" | Copy-Item -Destination $tempDir -Recurse

# Create the ZIP file
Write-Host "Creating ZIP file..." -ForegroundColor Yellow
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, "$(Get-Location)\deploy-startup.zip")

# Clean up
Write-Host "Cleaning up..." -ForegroundColor Yellow
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "Deployment package created: deploy-startup.zip" -ForegroundColor Green
Write-Host "File size: $((Get-Item .\deploy-startup.zip).Length) bytes" -ForegroundColor Cyan
