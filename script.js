const GROQ_API_KEY = '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';
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

// Store conversation history
let conversationHistory = [
    {
        role: "system",
        content: `You are Batman, responding directly without any narrative descriptions or action tags. Never use phrases like "(in a deep voice)" or similar narrative descriptions. Speak directly as Batman would and sometime try to be funny and use normal simple words.

Your responses should be concise, direct, and purposeful. You are the legendary vigilante of Gotham City, speaking with authority and unwavering determination. Maintain a serious and brooding demeanor, with occasional subtle hints of dry humor.

Focus on crime-fighting, detective work, tactical planning, and Gotham's well-being. Show resilience, resourcefulness, and a strong moral code. Keep personal details about Bruce Wayne minimal.`
    },
    {
        role: "assistant",
        content: "I am vengeance. I am the night. How can I assist you, citizen of Gotham?"
    }
];

async function sendMessage(message) {
    try {
        conversationHistory.push({
            role: "user",
            content: message
        });

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: conversationHistory,
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const assistantResponse = data.choices[0].message.content;
        
        conversationHistory.push({
            role: "assistant",
            content: assistantResponse
        });

        if (conversationHistory.length > 12) {
            conversationHistory = [
                conversationHistory[0],
                ...conversationHistory.slice(-10)
            ];
        }

        return assistantResponse;
    } catch (error) {
        console.error('Error:', error);
        if (error.message.includes('401')) {
            return "Access denied to Batcomputer. Please check your API key configuration.";
        }
        return "Batman is currently busy, please try again later.";
    }
}

function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    
    if (!isUser) {
        const avatar = document.createElement('img');
        avatar.src = 'batman-icon.png';
        avatar.alt = 'Batman';
        avatar.className = 'message-avatar';
        messageDiv.appendChild(avatar);
    }
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;
    
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    scrollToBottom();
}

async function handleUserMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    userInput.value = '';
    userInput.disabled = true;
    sendButton.disabled = true;

    const response = await sendMessage(message);
    addMessage(response);

    userInput.disabled = false;
    sendButton.disabled = false;
    userInput.focus();
}

sendButton.addEventListener('click', handleUserMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleUserMessage();
    }
});

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

window.onload = function() {
    if (!GROQ_API_KEY) {
        addMessage("ERROR: Batcomputer access requires API key configuration. Please set up your GROQ API key.");
        userInput.disabled = true;
        sendButton.disabled = true;
    }
    userInput.focus();
}; 