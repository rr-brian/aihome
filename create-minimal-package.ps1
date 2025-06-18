# PowerShell script to create a minimal deployment package
Write-Host "Creating minimal deployment package..." -ForegroundColor Green

# Check if the zip file already exists and delete it
if (Test-Path -Path ".\deploy-minimal.zip") {
    Remove-Item -Path ".\deploy-minimal.zip" -Force
}

# Create a temporary directory for the files
$tempDir = ".\temp-minimal"
if (Test-Path -Path $tempDir) {
    Remove-Item -Path $tempDir -Recurse -Force
}
New-Item -Path $tempDir -ItemType Directory | Out-Null

# Copy only the essential files
Write-Host "Copying essential files..." -ForegroundColor Yellow
Copy-Item -Path ".\server.js" -Destination $tempDir
Copy-Item -Path ".\package.json" -Destination $tempDir
Copy-Item -Path ".\web.config" -Destination $tempDir
Copy-Item -Path ".\index.html" -Destination $tempDir
Copy-Item -Path ".\styles.css" -Destination $tempDir
Copy-Item -Path ".\script.js" -Destination $tempDir
Copy-Item -Path ".\images" -Destination "$tempDir\images" -Recurse -ErrorAction SilentlyContinue

# Create the ZIP file
Write-Host "Creating ZIP file..." -ForegroundColor Yellow
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, "$(Get-Location)\deploy-minimal.zip")

# Clean up
Write-Host "Cleaning up..." -ForegroundColor Yellow
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "Minimal deployment package created: deploy-minimal.zip" -ForegroundColor Green
Write-Host "File size: $((Get-Item .\deploy-minimal.zip).Length) bytes" -ForegroundColor Cyan
