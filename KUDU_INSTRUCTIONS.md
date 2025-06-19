# Accessing Kudu Console for Deployment Troubleshooting

To check detailed deployment logs and verify file deployments:

1. Go to the Azure Portal
2. Navigate to your App Service (rr-aihome)
3. Go to "Development Tools" > "Advanced Tools (Kudu)"
4. Click "Go" to open Kudu
5. Navigate to "Debug console" > "CMD" or "PowerShell"
6. Navigate to site/wwwroot
7. Check if the files have been updated with the latest changes

## Common Commands in Kudu Console

```
cd site\wwwroot
dir
type index.html
type script.js
```

## Checking Deployment Logs

1. In Kudu, go to "Deployments"
2. Click on the latest deployment
3. Check the detailed logs for any errors or warnings
