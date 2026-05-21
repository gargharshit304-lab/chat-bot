const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');
const hasBuiltFrontend = fs.existsSync(distPath);

// Middleware
app.use(cors());
app.use(express.json());

// Simple AI response generator - can be replaced with actual AI API (OpenAI, Hugging Face, etc.)
function generateAIResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  
  // Simple rule-based responses
  const responses = {
    'hello': 'Hey there! How can I help you today?',
    'hi': 'Hello! What can I do for you?',
    'how are you': 'I\'m doing great! Thanks for asking. How about you?',
    'what is your name': 'I\'m ACE. Nice to meet you!',
    'thanks': 'You\'re welcome! Happy to help.',
    'thank you': 'My pleasure! Let me know if you need anything else.',
    'bye': 'Goodbye! Talk to you later.',
    'what time is it': `The current time is ${new Date().toLocaleTimeString()}.`,
    'help': 'I\'m here to chat with you! Try asking me something or just have a conversation.',
    'date': `Today\'s date is ${new Date().toLocaleDateString()}.`,
  };

  // Check for exact matches
  for (const [key, value] of Object.entries(responses)) {
    if (lowerMessage.includes(key)) {
      return value;
    }
  }

  // Check for code block request
  if (lowerMessage.includes('code') || lowerMessage.includes('example')) {
    return `Here's a simple JavaScript example:\n\n\`\`\`javascript\nconst greeting = (name) => {\n  return \`Hello, \${name}!\`;\n};\n\nconsole.log(greeting('World'));\n\`\`\``;
  }

  // Check for markdown request
  if (lowerMessage.includes('markdown')) {
    return `Here's a Markdown example:\n\n# Heading 1\n## Heading 2\n\n- List item 1\n- List item 2\n- List item 3\n\n**Bold text** and *italic text*`;
  }

  // Check for math/calculation
  if (lowerMessage.includes('calculate') || lowerMessage.includes('what is 2 + 2')) {
    return '2 + 2 equals 4. Try asking me other math questions!';
  }

  // Default response
  const defaultResponses = [
    'That\'s interesting! Tell me more.',
    'I understand. Could you provide more details?',
    'Hmm, I\'m not entirely sure about that. Can you rephrase?',
    'I find that topic fascinating! What else would you like to know?',
    'That sounds important. How can I assist you with that?',
    'I\'d love to help with that! Could you be more specific?',
    'Interesting perspective! Tell me more.',
  ];

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', message: 'AI Chatbot Backend is active' });
});

// Serve the built React app when available
if (hasBuiltFrontend) {
  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/chat') || req.path.startsWith('/health')) {
      return next();
    }

    if (req.method === 'GET') {
      return res.sendFile(path.join(distPath, 'index.html'));
    }

    return next();
  });
} else {
  app.get('/', (req, res) => {
    res.json({ status: 'Server is running', message: 'AI Chatbot Backend is active' });
  });
}

// Chat endpoint
app.post('/chat', (req, res) => {
  try {
    const { message } = req.body;

    // Validate input
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required and must be a non-empty string' });
    }

    // Generate AI response
    const reply = generateAIResponse(message.trim());

    // Simulate slight delay for realistic response (optional)
    setTimeout(() => {
      res.json({ reply });
    }, 300 + Math.random() * 700); // 300-1000ms delay

  } catch (error) {
    console.error('Error in /chat endpoint:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Chatbot Backend is running on http://localhost:${PORT}`);
  console.log(`📝 Send POST requests to http://localhost:${PORT}/chat`);
  console.log(`💡 Request body: { "message": "your message" }`);
  console.log(`✨ Response: { "reply": "AI response" }`);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('Server shutting down...');
  process.exit(0);
});
