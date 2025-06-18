@echo off
echo ========== Deployment script started ==========

:: KuduSync is the default deployment step that copies files to the target directory
:: We need to make sure our npm install runs after that

:: 1. Set up environment
echo Setting up environment variables
SET DEPLOYMENT_SOURCE=%~dp0%
IF NOT DEFINED DEPLOYMENT_TARGET (
  SET DEPLOYMENT_TARGET=%DEPLOYMENT_SOURCE%
)
echo Deployment source: %DEPLOYMENT_SOURCE%
echo Deployment target: %DEPLOYMENT_TARGET%

:: 2. Install npm packages
IF EXIST "%DEPLOYMENT_TARGET%\package.json" (
  echo Installing npm packages...
  pushd "%DEPLOYMENT_TARGET%"
  
  :: Ensure we have the latest npm
  call npm install -g npm
  
  :: Install dependencies
  echo Running npm install --production
  call npm install --production
  IF !ERRORLEVEL! NEQ 0 (
    echo npm install failed with error !ERRORLEVEL!
    goto error
  )
  
  :: Print installed packages for debugging
  echo Listing installed packages:
  call npm list --depth=0
  
  popd
) ELSE (
  echo WARNING: package.json not found in %DEPLOYMENT_TARGET%
)

:: 3. Print diagnostic information
echo ========== Deployment Diagnostics ==========
echo Node version:
call node -v
echo NPM version:
call npm -v
echo Current directory structure:
dir "%DEPLOYMENT_TARGET%"
echo Environment variables:
set

echo ========== Deployment script completed successfully ==========
exit /b 0

:error
echo ========== ERROR: Deployment failed ==========
echo Error code: %ERRORLEVEL%
echo Please check the logs for more details.
exit /b 1
exit /b 1
