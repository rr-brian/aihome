document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Add event listeners
    sendButton.addEventListener('click', handleUserMessage);
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserMessage();
        }
    });

    // Add a welcome message with timestamp for deployment verification
    addBotMessage("Hello! I'm an AI assistant powered by Realty Technology Services and OpenAI. How can I help you today? (Manual deployment: 2025-06-19 08:47:18)");

    async function handleUserMessage() {
        const userMessage = userInput.value.trim();
        if (!userMessage) return;

        // Clear input
        userInput.value = '';

        // Add user message to chat
        addUserMessage(userMessage);

        // Show typing indicator
        const typingIndicator = showTypingIndicator();

        try {
            // Call the API
            const response = await callAzureOpenAI(userMessage);
            
            // Remove typing indicator
            typingIndicator.remove();
            
            // Add bot response
            addBotMessage(response);
        } catch (error) {
            // Remove typing indicator
            typingIndicator.remove();
            
            // Show error message
            addBotMessage("I'm sorry, I encountered an error. Please try again later.");
            console.error("Error:", error);
        }
    }

    function addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }

    function addBotMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        // Convert markdown-like syntax to HTML
        const formattedMessage = message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>')             // Italic
            .replace(/\n\n/g, '<br><br>')                     // Paragraphs
            .replace(/\n/g, '<br>');                          // Line breaks
        
        messageDiv.innerHTML = formattedMessage;
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        chatMessages.appendChild(typingDiv);
        scrollToBottom();
        return typingDiv;
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function callAzureOpenAI(userMessage) {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: userMessage })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Error calling API:', error);
            return "I'm sorry, I encountered an error while processing your request. Please try again later.";
        }
    }
});


