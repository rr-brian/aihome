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
    
    // If file doesn't exist in current directory, try wwwroot (common Azure App Service path)
    if (!fileExists && process.env.HOME) {
      const wwwrootPath = path.join(process.env.HOME, 'site', 'wwwroot', filePath);
      fileExists = fs.existsSync(wwwrootPath);
      console.log(`[${new Date().toISOString()}] Checking Azure path: ${wwwrootPath}, exists: ${fileExists}`);
      
      if (fileExists) {
        absolutePath = wwwrootPath;
      }
    }
    
    // If still not found, try one level up (sometimes needed in Azure)
    if (!fileExists) {
      const parentPath = path.resolve(__dirname, '..', filePath);
      fileExists = fs.existsSync(parentPath);
      console.log(`[${new Date().toISOString()}] Checking parent path: ${parentPath}, exists: ${fileExists}`);
      
      if (fileExists) {
        absolutePath = parentPath;
      }
    }
    
    console.log(`[${new Date().toISOString()}] Reading file from: ${absolutePath}`);
    const content = fs.readFileSync(absolutePath);
    
    // Add cache control headers to prevent caching
    const cacheHeaders = {
      'Content-Type': contentType,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    };
    
    res.writeHead(200, cacheHeaders);
    res.end(content, 'utf-8');
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error serving file ${filePath}:`, error);
    
    if (error.code === 'ENOENT') {
      // Log more detailed information about the file not found
      console.error(`[${new Date().toISOString()}] File not found details:`);
      console.error(`  - Requested path: ${filePath}`);
      console.error(`  - Current directory: ${__dirname}`);
      console.error(`  - HOME env: ${process.env.HOME || 'not set'}`);
      
      // Try to list the directory contents to help with debugging
      try {
        const dirPath = path.dirname(path.resolve(__dirname, filePath));
        console.error(`[${new Date().toISOString()}] Listing directory: ${dirPath}`);
        const files = fs.readdirSync(dirPath);
        console.error(`  - Directory contents: ${files.join(', ')}`);
      } catch (dirError) {
        console.error(`[${new Date().toISOString()}] Could not list directory:`, dirError);
      }
      
      res.writeHead(404);
      res.end(`File not found: ${filePath}`);
    } else {
      res.writeHead(500);
      res.end(`Internal Server Error: ${error.message}`);
    }
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
