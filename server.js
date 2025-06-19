// Check for dependencies first
try {
  require.resolve('openai');
  require.resolve('dotenv');
  console.log('Dependencies found, proceeding with server startup...');
} catch (err) {
  console.log('Dependencies missing, attempting to install...');
  try {
    const { execSync } = require('child_process');
    execSync('npm install', { stdio: 'inherit' });
    console.log('Dependencies installed successfully.');
  } catch (installErr) {
    console.error('Failed to install dependencies:', installErr);
    process.exit(1);
  }
}

const http = require('http');
const fs = require('fs');
const path = require('path');
const { AzureOpenAI } = require('openai');
require('dotenv').config();

// Create a simple HTTP server
// Get port from environment variable for Azure compatibility
// Azure Web Apps will set process.env.PORT
const port = process.env.PORT || 3000;
console.log(`Using port: ${port}`);

// Log environment variables for debugging (excluding sensitive info)
console.log('Environment variables:');
console.log(`AZURE_OPENAI_ENDPOINT: ${process.env.AZURE_OPENAI_ENDPOINT ? 'Set' : 'Not set'}`);
console.log(`AZURE_OPENAI_DEPLOYMENT: ${process.env.AZURE_OPENAI_DEPLOYMENT || 'Not set'}`);
console.log(`AZURE_OPENAI_API_VERSION: ${process.env.AZURE_OPENAI_API_VERSION || 'Not set'}`);
console.log(`AZURE_OPENAI_API_KEY: ${process.env.AZURE_OPENAI_API_KEY ? 'Set (hidden)' : 'Not set'}`);


const server = http.createServer(async (req, res) => {
  // Parse the URL and remove query parameters
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  
  console.log(`Received request for: ${pathname}`);
  
  // Handle Azure health check probe
  if (pathname === '/robots933456.txt') {
    console.log('Handling Azure health check request');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Health check OK');
    return;
  }
  
  // Diagnostic endpoint to list all files in the deployment directory
  if (pathname === '/diagnostics/files') {
    console.log('Handling diagnostics/files request');
    
    function listFilesRecursively(dir, basePath = '') {
      let results = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const relativePath = path.join(basePath, entry.name);
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          results.push({ type: 'directory', path: relativePath });
          results = results.concat(listFilesRecursively(fullPath, relativePath));
        } else {
          results.push({ 
            type: 'file', 
            path: relativePath,
            size: fs.statSync(fullPath).size,
            extension: path.extname(entry.name)
          });
        }
      }
      
      return results;
    }
    
    try {
      const diagnosticInfo = {
        timestamp: new Date().toISOString(),
        currentDirectory: __dirname,
        homeDirectory: process.env.HOME || 'not set',
        nodeEnv: process.env.NODE_ENV || 'not set',
        platform: process.platform,
        nodeVersion: process.version,
        files: []
      };
      
      // List files in the current directory
      diagnosticInfo.files.push({ location: 'current directory', files: listFilesRecursively(__dirname) });
      
      // Try to list files in the Azure wwwroot directory if it exists
      if (process.env.HOME) {
        const wwwrootPath = path.join(process.env.HOME, 'site', 'wwwroot');
        if (fs.existsSync(wwwrootPath)) {
          diagnosticInfo.files.push({ location: 'Azure wwwroot', files: listFilesRecursively(wwwrootPath) });
        }
      }
      
      // Try to list files in D:\home\site\wwwroot if it exists (Windows Azure)
      const windowsPath = path.join('D:', 'home', 'site', 'wwwroot');
      if (fs.existsSync(windowsPath)) {
        diagnosticInfo.files.push({ location: 'Windows Azure path', files: listFilesRecursively(windowsPath) });
      }
      
      // Try to list files in /home/site/wwwroot if it exists (Linux Azure)
      const linuxPath = '/home/site/wwwroot';
      if (fs.existsSync(linuxPath)) {
        diagnosticInfo.files.push({ location: 'Linux Azure path', files: listFilesRecursively(linuxPath) });
      }
      
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      });
      res.end(JSON.stringify(diagnosticInfo, null, 2));
    } catch (error) {
      console.error('Error in diagnostics endpoint:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message, stack: error.stack }));
    }
    return;
  }
  
  // Special route to serve direct-test-route directly from code
  if (pathname === '/direct-test-route') {
    console.log('Serving direct-test-route');
    res.writeHead(200, { 
      'Content-Type': 'text/html',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
          <title>Direct Test Route</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              body {
                  font-family: Arial, sans-serif;
                  margin: 40px;
                  line-height: 1.6;
              }
              .container {
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 20px;
                  border: 1px solid #ddd;
                  border-radius: 5px;
              }
              h1 {
                  color: #0078d4;
              }
              .timestamp {
                  font-style: italic;
                  color: #666;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Direct Test Route</h1>
              <p>This content is being served directly from the Node.js server code, not from a static file.</p>
              <p class="timestamp">Timestamp: ${new Date().toISOString()}</p>
              
              <h2>Environment Information</h2>
              <ul>
                  <li>Node.js Version: ${process.version}</li>
                  <li>Platform: ${process.platform}</li>
                  <li>Current Directory: ${__dirname}</li>
                  <li>HOME Environment: ${process.env.HOME || 'not set'}</li>
              </ul>
              
              <h2>Test Links</h2>
              <ul>
                  <li><a href="/">Home Page</a></li>
                  <li><a href="/direct-test.html">Direct Test HTML (static file)</a></li>
                  <li><a href="/simple-test.html">Simple Test HTML (static file)</a></li>
                  <li><a href="/diagnostics/files">Diagnostics: File List</a></li>
              </ul>
          </div>
      </body>
      </html>
    `);
    return;
  }
  

  
  // Handle API requests
  if (pathname === '/api/chat' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const { message } = JSON.parse(body);
        
        // Call Azure OpenAI API
        const response = await callAzureOpenAI(message);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ response }));
      } catch (error) {
        console.error('Error processing request:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      }
    });
    
    return;
  }
  
  // Handle favicon.ico request
  if (pathname === '/favicon.ico') {
    console.log('Handling favicon.ico request');
    res.writeHead(204); // No content response
    res.end();
    return;
  }
  
  // Special route to serve direct-test.html directly from code
  if (pathname === '/direct-test-route') {
    console.log('Serving direct-test-route');
    res.writeHead(200, { 
      'Content-Type': 'text/html',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
          <title>Direct Test Route</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              body {
                  font-family: Arial, sans-serif;
                  margin: 40px;
                  line-height: 1.6;
              }
              .container {
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 20px;
                  border: 1px solid #ddd;
                  border-radius: 5px;
              }
              h1 {
                  color: #0078d4;
              }
              .timestamp {
                  font-style: italic;
                  color: #666;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Direct Test Route</h1>
              <p>This content is being served directly from the Node.js server code, not from a static file.</p>
              <p class="timestamp">Timestamp: ${new Date().toISOString()}</p>
              
              <h2>Environment Information</h2>
              <ul>
                  <li>Node.js Version: ${process.version}</li>
                  <li>Platform: ${process.platform}</li>
                  <li>Current Directory: ${__dirname}</li>
                  <li>HOME Environment: ${process.env.HOME || 'not set'}</li>
              </ul>
              
              <h2>Test Links</h2>
              <ul>
                  <li><a href="/">Home Page</a></li>
                  <li><a href="/direct-test.html">Direct Test HTML (static file)</a></li>
                  <li><a href="/simple-test.html">Simple Test HTML (static file)</a></li>
                  <li><a href="/diagnostics/files">Diagnostics: File List</a></li>
              </ul>
          </div>
      </body>
      </html>
    `);
    return;
  }

  // Serve static files
  let filePath = pathname === '/' ? 'index.html' : pathname.substring(1);
  
  // Normalize the file path to handle Windows path separators
  filePath = path.normalize(filePath);
  
  console.log(`[${new Date().toISOString()}] Attempting to serve file: ${filePath}`);
  console.log(`[${new Date().toISOString()}] Current directory: ${__dirname}`);
  console.log(`[${new Date().toISOString()}] HOME environment: ${process.env.HOME || 'not set'}`);
  
  const extname = path.extname(filePath);
  let contentType = 'text/html';
  
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
    case '.jpeg':
      contentType = 'image/jpeg';
      break;
    case '.gif':
      contentType = 'image/gif';
      break;
    case '.svg':
      contentType = 'image/svg+xml';
      break;
    case '.ico':
      contentType = 'image/x-icon';
      break;
  }
  
  try {
    // Use absolute path for file reading
    // First try the current directory
    let absolutePath = path.resolve(__dirname, filePath);
    let fileExists = fs.existsSync(absolutePath);
    
    // Log the file path and whether it exists
    console.log(`[${new Date().toISOString()}] Checking path: ${absolutePath}, exists: ${fileExists}`);
    
    // Try all possible paths where the file might be located
    const possiblePaths = [
      // Current directory
      absolutePath,
      
      // Azure App Service wwwroot path
      process.env.HOME ? path.join(process.env.HOME, 'site', 'wwwroot', filePath) : null,
      
      // One level up from current directory
      path.resolve(__dirname, '..', filePath),
      'Content-Type': contentType,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
      currentDirectory: __dirname,
      homeDirectory: process.env.HOME || 'not set',
      nodeEnv: process.env.NODE_ENV || 'not set',
      appRoot: path.resolve(__dirname),
      osType: process.platform,
      nodeVersion: process.version
    };
    
    console.error(`[${new Date().toISOString()}] Error details:`, JSON.stringify(errorInfo, null, 2));
    
    // Try to list the directory contents to help with debugging
    try {
      const dirPath = path.dirname(path.resolve(__dirname, filePath));
      console.error(`[${new Date().toISOString()}] Listing directory: ${dirPath}`);
      const files = fs.readdirSync(dirPath);
      console.error(`  - Directory contents: ${files.join(', ')}`);
    } catch (dirError) {
      console.error(`[${new Date().toISOString()}] Could not list directory:`, dirError);
    }
    
    // Send a more informative error page
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>File Not Found</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
          h1 { color: #d9534f; }
          pre { background-color: #f8f9fa; padding: 15px; overflow: auto; }
          .timestamp { font-style: italic; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>File Not Found</h1>
          <p>The requested file <strong>${filePath}</strong> could not be found on the server.</p>
          <p class="timestamp">Timestamp: ${new Date().toISOString()}</p>
          
          <h2>Debug Information</h2>
          <pre>${JSON.stringify(errorInfo, null, 2)}</pre>
          
          <h2>Available Test Files</h2>
          <ul>
            <li><a href="/">Home Page (index.html)</a></li>
            <li><a href="/simple-test.html">Simple Test Page</a></li>
            <li><a href="/static-test.html">Static Test Page</a></li>
            <li><a href="/file-test.html">File Test Page</a></li>
            <li><a href="/web-config-test.html">Web Config Test Page</a></li>
          </ul>
        </div>
      </body>
      </html>
    `);
  }
});

// Azure OpenAI API call function
async function callAzureOpenAI(userMessage) {
  try {
    // Get environment variables
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2025-01-01-preview";
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4.1";
    
    // Check if required environment variables are set
    if (!endpoint || !apiKey) {
      console.error('Missing required environment variables: AZURE_OPENAI_ENDPOINT or AZURE_OPENAI_API_KEY');
      throw new Error('Azure OpenAI credentials not configured properly. Please check your .env file.');
    }
    
    console.log('=== DEBUG INFO ===');
    console.log(`Endpoint: ${endpoint}`);
    console.log(`API Key (first 5 chars): ${apiKey.substring(0, 5)}...`);
    console.log(`API Version: ${apiVersion}`);
    console.log(`Deployment: ${deployment}`);
    console.log('=================');

    // Create Azure OpenAI client with the correct configuration
    const client = new AzureOpenAI({
      apiKey: apiKey,
      endpoint: endpoint,
      apiVersion: apiVersion,
      defaultDeployment: deployment
    });

    console.log('Making API call to Azure OpenAI...');
    try {
      const result = await client.chat.completions.create({
        model: deployment,
        messages: [
          { role: "system", content: "You are an AI assistant that helps people find information." },
          { role: "user", content: userMessage }
        ],
        max_tokens: 800,
        temperature: 1,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: null
      });
      
      console.log('API call successful!');
      return result.choices[0].message.content;
    } catch (error) {
      console.error('=== AZURE OPENAI API ERROR ===');
      console.error(`Error name: ${error.name}`);
      console.error(`Error message: ${error.message}`);
      console.error(`Error status: ${error.status || 'N/A'}`);
      console.error(`Error code: ${error.code || 'N/A'}`);
      if (error.response) {
        console.error(`Response status: ${error.response.status}`);
        console.error(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      console.error('============================');
      throw error;
    }
  } catch (error) {
    console.error('Azure OpenAI API error:', error);
    throw error;
  }
}

// Start the server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
