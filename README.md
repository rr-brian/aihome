# AI Chatbot Web Application

A modern web application with a chatbot powered by Azure OpenAI's GPT-4.1 model.

## Features

- Clean, responsive UI
- Real-time chat interface
- Markdown support for rich text responses
- Powered by Azure OpenAI GPT-4.1

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Configure your Azure OpenAI credentials:
   - Edit the `.env` file and add your Azure OpenAI API key and endpoint

3. Start the server:
   ```
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## API Integration

The application uses Azure OpenAI's API to generate responses. The server handles the API calls securely without exposing your API key to the client.

## Technologies Used

- HTML5, CSS3, JavaScript
- Node.js for the backend server
- Azure OpenAI API for the chatbot functionality
