// File listing diagnostic script
const fs = require('fs');
const path = require('path');
const http = require('http');

// Function to recursively list files in a directory
function listFilesRecursive(dir, baseDir = '') {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(baseDir, entry.name);
    
    if (entry.isDirectory()) {
      files.push({ 
        path: relativePath, 
        type: 'directory' 
      });
      files.push(...listFilesRecursive(fullPath, relativePath));
    } else {
      files.push({ 
        path: relativePath, 
        type: 'file',
        size: fs.statSync(fullPath).size
      });
    }
  }
  
  return files;
}

// Create a simple HTTP server to display the file list
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    
    try {
      // Get environment info
      const env = {
        NODE_ENV: process.env.NODE_ENV || 'Not set',
        HOME: process.env.HOME || 'Not set',
        WEBSITE_SITE_NAME: process.env.WEBSITE_SITE_NAME || 'Not set',
        WEBSITE_INSTANCE_ID: process.env.WEBSITE_INSTANCE_ID || 'Not set',
        WEBSITE_OWNER_NAME: process.env.WEBSITE_OWNER_NAME || 'Not set',
        WEBSITE_RESOURCE_GROUP: process.env.WEBSITE_RESOURCE_GROUP || 'Not set',
        WEBSITE_SKU: process.env.WEBSITE_SKU || 'Not set',
        WEBSITE_HOSTNAME: process.env.WEBSITE_HOSTNAME || 'Not set',
        PORT: process.env.PORT || 'Not set'
      };
      
      // Get current directory
      const currentDir = process.cwd();
      
      // List files in current directory
      const currentDirFiles = listFilesRecursive(currentDir);
      
      // Check if we're in Azure and list files in wwwroot if available
      let wwwrootFiles = [];
      const wwwrootPath = process.env.HOME ? path.join(process.env.HOME, 'site', 'wwwroot') : null;
      
      if (wwwrootPath && fs.existsSync(wwwrootPath)) {
        wwwrootFiles = listFilesRecursive(wwwrootPath);
      }
      
      // Generate HTML output
      let html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Azure App Service File Diagnostic</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1, h2 { color: #0078D4; }
            pre { background-color: #f5f5f5; padding: 10px; border-radius: 5px; }
            .file { color: #333; }
            .directory { color: #0078D4; font-weight: bold; }
            .timestamp { color: #666; font-style: italic; }
          </style>
        </head>
        <body>
          <h1>Azure App Service File Diagnostic</h1>
          <p class="timestamp">Generated at: ${new Date().toISOString()}</p>
          
          <h2>Environment Information</h2>
          <pre>${JSON.stringify(env, null, 2)}</pre>
          
          <h2>Current Directory: ${currentDir}</h2>
          <pre>`;
      
      // Add current directory files
      for (const file of currentDirFiles) {
        html += `<div class="${file.type}">${file.path} ${file.type === 'file' ? `(${file.size} bytes)` : ''}</div>`;
      }
      
      html += `</pre>`;
      
      // Add wwwroot files if available
      if (wwwrootFiles.length > 0) {
        html += `
          <h2>WWWRoot Directory: ${wwwrootPath}</h2>
          <pre>`;
        
        for (const file of wwwrootFiles) {
          html += `<div class="${file.type}">${file.path} ${file.type === 'file' ? `(${file.size} bytes)` : ''}</div>`;
        }
        
        html += `</pre>`;
      }
      
      // Add specific file checks for our test files
      const testFiles = [
        'static-test.html',
        'iistest.html',
        'diagnostic-page.html',
        'deployment-test.html',
        'github-auto-test.html'
      ];
      
      html += `<h2>Test File Existence Check</h2><pre>`;
      
      for (const testFile of testFiles) {
        // Check in current directory
        const exists = fs.existsSync(path.join(currentDir, testFile));
        html += `${testFile} in ${currentDir}: ${exists ? 'EXISTS' : 'NOT FOUND'}\n`;
        
        // Check in wwwroot if available
        if (wwwrootPath) {
          const wwwrootExists = fs.existsSync(path.join(wwwrootPath, testFile));
          html += `${testFile} in ${wwwrootPath}: ${wwwrootExists ? 'EXISTS' : 'NOT FOUND'}\n`;
        }
      }
      
      html += `</pre>
        </body>
        </html>
      `;
      
      res.end(html);
    } catch (error) {
      res.end(`<h1>Error</h1><pre>${error.stack}</pre>`);
    }
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

// Get port from environment or use 8080
const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`Diagnostic server running at http://localhost:${port}/`);
});
