// Diagnostic script to help troubleshoot file path issues on Azure App Service
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Request received: ${req.url}`);

  // Return diagnostic information
  const diagnosticInfo = {
    timestamp: timestamp,
    environment: {
      platform: os.platform(),
      type: os.type(),
      release: os.release(),
      hostname: os.hostname(),
      homedir: os.homedir(),
      tempdir: os.tmpdir(),
      cwd: process.cwd(),
      dirname: __dirname,
      env: {
        HOME: process.env.HOME,
        WEBSITE_SITE_NAME: process.env.WEBSITE_SITE_NAME,
        WEBSITE_INSTANCE_ID: process.env.WEBSITE_INSTANCE_ID,
        WEBSITE_OWNER_NAME: process.env.WEBSITE_OWNER_NAME,
        WEBSITE_RESOURCE_GROUP: process.env.WEBSITE_RESOURCE_GROUP,
        PORT: process.env.PORT
      }
    },
    directoryStructure: {}
  };

  // Check if common directories exist
  const dirsToCheck = [
    '.',
    '..',
    '/home',
    '/home/site',
    '/home/site/wwwroot',
    path.join(process.env.HOME || '', 'site'),
    path.join(process.env.HOME || '', 'site', 'wwwroot')
  ];

  dirsToCheck.forEach(dir => {
    try {
      if (fs.existsSync(dir)) {
        diagnosticInfo.directoryStructure[dir] = {
          exists: true,
          isDirectory: fs.statSync(dir).isDirectory(),
          contents: fs.readdirSync(dir).slice(0, 20) // Limit to first 20 items
        };
      } else {
        diagnosticInfo.directoryStructure[dir] = {
          exists: false
        };
      }
    } catch (error) {
      diagnosticInfo.directoryStructure[dir] = {
        exists: 'error',
        error: error.message
      };
    }
  });

  // Check specific files
  const filesToCheck = [
    'index.html',
    'server.js',
    'deployment-test.html',
    'test-deployment-20250619-0913.html',
    path.join('/', 'home', 'site', 'wwwroot', 'index.html'),
    path.join('/', 'home', 'site', 'wwwroot', 'deployment-test.html')
  ];

  diagnosticInfo.fileChecks = {};

  filesToCheck.forEach(file => {
    try {
      const exists = fs.existsSync(file);
      diagnosticInfo.fileChecks[file] = {
        exists: exists
      };
      
      if (exists) {
        const stats = fs.statSync(file);
        diagnosticInfo.fileChecks[file].isFile = stats.isFile();
        diagnosticInfo.fileChecks[file].size = stats.size;
        diagnosticInfo.fileChecks[file].mtime = stats.mtime;
        
        // If it's an HTML or JS file, show a snippet of content
        if (file.endsWith('.html') || file.endsWith('.js')) {
          try {
            const content = fs.readFileSync(file, 'utf8');
            diagnosticInfo.fileChecks[file].snippet = content.substring(0, 200) + '...';
          } catch (readError) {
            diagnosticInfo.fileChecks[file].readError = readError.message;
          }
        }
      }
    } catch (error) {
      diagnosticInfo.fileChecks[file] = {
        exists: 'error',
        error: error.message
      };
    }
  });

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(diagnosticInfo, null, 2));
});

server.listen(port, () => {
  console.log(`Diagnostic server running on port ${port}`);
  console.log(`Current directory: ${process.cwd()}`);
  console.log(`__dirname: ${__dirname}`);
  console.log(`Environment variables: ${JSON.stringify(process.env, null, 2)}`);
});
