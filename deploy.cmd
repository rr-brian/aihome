@echo off
echo Deployment script started

:: 1. Install npm packages
IF EXIST "%DEPLOYMENT_TARGET%\package.json" (
  echo Installing npm packages
  pushd "%DEPLOYMENT_TARGET%"
  call npm install --production
  IF !ERRORLEVEL! NEQ 0 goto error
  popd
)

:: 2. Print diagnostic information
echo Node version:
node -v
echo NPM version:
npm -v
echo Current directory:
dir

echo Deployment script completed successfully
exit /b 0

:error
echo Failed to deploy: %ERRORLEVEL%
exit /b 1
