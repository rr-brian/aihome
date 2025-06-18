// Test script for Azure OpenAI API connection
const { AzureOpenAI } = require('openai');
require('dotenv').config();

async function testAzureOpenAI() {
  try {
    // Get environment variables
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2025-01-01-preview";
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4.1";
    
    console.log('=== DEBUG INFO ===');
    console.log(`Endpoint: ${endpoint}`);
    console.log(`API Key (first 5 chars): ${apiKey.substring(0, 5)}...`);
    console.log(`API Version: ${apiVersion}`);
    console.log(`Deployment: ${deployment}`);
    console.log('=================');
    
    // Create Azure OpenAI client
    console.log('Creating Azure OpenAI client...');
    const client = new AzureOpenAI({
      apiKey: apiKey,
      endpoint: endpoint,
      apiVersion: apiVersion,
      defaultDeployment: deployment
    });
    
    // Test with a simple message
    console.log('Making API call to Azure OpenAI...');
    const result = await client.chat.completions.create({
      model: deployment,
      messages: [
        { role: "system", content: "You are an AI assistant that helps people find information." },
        { role: "user", content: "Hello, can you help me?" }
      ],
      max_tokens: 50,
      temperature: 1
    });
    
    console.log('API call successful!');
    console.log('Response:', result.choices[0].message.content);
    
  } catch (error) {
    console.error('=== AZURE OPENAI API ERROR ===');
    console.error(`Error name: ${error.name}`);
    console.error(`Error message: ${error.message}`);
    
    // More detailed error logging
    if (error.response) {
      console.error(`Response status: ${error.response.status}`);
      console.error('Response headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Request details:');
      console.error('Request URL:', error.request.url || 'N/A');
      console.error('Request method:', error.request.method || 'N/A');
    } else {
      console.error('Error setting up the request:', error.message);
    }
    
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error('============================');
  }
}

// Run the test
testAzureOpenAI().then(() => {
  console.log('Test completed.');
});
