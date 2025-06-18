@echo off
echo Creating deployment package with node_modules...

REM Create a temporary directory for deployment
mkdir deploy-temp
echo Copying files to temporary directory...

REM Copy all files except node_modules and existing zip files
xcopy /E /I /Y *.* deploy-temp\ /EXCLUDE:node_modules\*.* *.zip
xcopy /E /I /Y node_modules deploy-temp\node_modules\

REM Create the ZIP file using PowerShell
echo Creating ZIP file...
powershell -Command "Add-Type -Assembly 'System.IO.Compression.FileSystem'; [System.IO.Compression.ZipFile]::CreateFromDirectory('deploy-temp', 'deploy-complete.zip')"

REM Clean up temporary directory
rmdir /S /Q deploy-temp

echo Deployment package created: deploy-complete.zip
