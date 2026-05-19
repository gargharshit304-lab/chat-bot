# 💬 AI Chatbot - Frontend & Backend

A modern, responsive AI chatbot with a beautiful frontend UI and Node.js + Express backend API.

## 📁 Project Structure

```
ai chatbot/
├── index.html          # Frontend UI
├── script.js           # Frontend logic (vanilla JS)
├── style.css           # Frontend styles (dark theme)
├── server.js           # Backend API (Express.js)
├── package.json        # Dependencies
├── .env               # Environment configuration
├── .gitignore         # Git ignore rules
├── image/             # Images folder
└── README.md          # This file
```

## ✨ Features

### Frontend (Vanilla JavaScript)
- ✅ Modern, responsive dark theme UI
- ✅ Real-time message display with smooth animations
- ✅ Typing indicator with animated dots
- ✅ Auto-scrolling to latest message
- ✅ Enter key support (Shift+Enter for newline)
- ✅ Markdown rendering for AI responses
- ✅ Code block syntax highlighting
- ✅ Copy-to-clipboard button for code blocks
- ✅ Timestamps for each message
- ✅ Disabled send button during loading
- ✅ Error handling UI
- ✅ Clean, modular code structure

### Backend (Node.js + Express)
- ✅ REST API with `/chat` endpoint
- ✅ CORS support for cross-origin requests
- ✅ JSON request/response handling
- ✅ Rule-based AI responses (easily extensible)
- ✅ Error handling and validation
- ✅ Ready for OpenAI/external API integration

## 🚀 Setup & Installation

### 1. Install Backend Dependencies

Open your terminal in the project folder and run:

```bash
npm install
```

This will install:
- **express**: Web framework
- **cors**: Cross-Origin Resource Sharing
- **dotenv**: Environment variables

### 2. Start the Backend Server

```bash
npm start
```

You should see:
```
🚀 AI Chatbot Backend is running on http://localhost:3000
📝 Send POST requests to http://localhost:3000/chat
💡 Request body: { "message": "your message" }
✨ Response: { "reply": "AI response" }
```

### 3. Open the Frontend

Open `index.html` in your browser (or use Live Server if you have it installed).

## 🧪 Testing the API

### Using cURL:
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```

### Using Postman:
1. Create a new POST request
2. URL: `http://localhost:3000/chat`
3. Body (JSON): `{"message":"Hello"}`
4. Send

### Expected Response:
```json
{
  "reply": "Hey there! How can I help you today?"
}
```

## 🤖 Customize AI Responses

Edit the `generateAIResponse()` function in `server.js` to:
- Add more rule-based responses
- Integrate with OpenAI API
- Connect to other AI services
- Add database storage for context

### Example: Add OpenAI Integration

1. Install OpenAI:
```bash
npm install openai
```

2. Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=sk-...
```

3. Replace the `generateAIResponse()` function with:
```javascript
const { OpenAI } = require('openai');

async function generateAIResponse(userMessage) {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const message = await client.messages.create({
    model: 'gpt-4',
    max_tokens: 1024,
    messages: [{ role: 'user', content: userMessage }],
  });

  return message.content[0].text;
}
```

## 📝 API Documentation

### POST /chat

Send a message to the AI and receive a response.

**Request:**
```json
{
  "message": "What time is it?"
}
```

**Response (200 OK):**
```json
{
  "reply": "The current time is 2:45:30 PM."
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Message is required and must be a non-empty string"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "error": "Internal server error",
  "details": "Error message here"
}
```

## 🎨 Frontend Architecture

### Key Functions:

- **`pushMessage(role, content)`** - Add and render a message
- **`showTyping()`** - Display typing indicator
- **`removeTyping(node)`** - Remove typing indicator
- **`scrollToBottom()`** - Auto-scroll to latest message
- **`sendMessage(text)`** - Main handler for sending messages
- **`splitCodeBlocks(text)`** - Parse markdown code blocks
- **`escapeHtml(unsafe)`** - Sanitize HTML
- **`typeReply(text, container)`** - Typing animation effect

### Message Structure:
```javascript
{
  role: 'user' | 'ai',
  content: 'Message text',
  time: '2:45:30 PM'
}
```

## 🔧 Troubleshooting

### Backend won't start
- Check if port 3000 is already in use: `netstat -ano | findstr 3000`
- Kill the process: `taskkill /PID <PID> /F`
- Try a different port: `PORT=3001 npm start`

### Frontend can't reach backend
- Ensure backend is running on `http://localhost:3000`
- Check browser console for CORS errors
- Verify `.env` PORT matches your setup

### CORS errors
- Backend has CORS enabled by default
- If issues persist, check the `cors` middleware setup

## 🎯 Next Steps

1. **Add persistent storage**: Use MongoDB or Firebase to save chat history
2. **User authentication**: Add login/signup functionality
3. **Real AI integration**: Connect to OpenAI, Claude, or other APIs
4. **Voice input**: Add speech-to-text
5. **Mobile app**: Convert to React Native or Flutter
6. **Deployment**: Deploy to Vercel, Netlify (frontend) and Heroku (backend)

## 📄 License

MIT - Feel free to use this project for anything!

## 💡 Tips

- Press `Enter` to send a message
- Press `Shift + Enter` to add a new line
- Code blocks automatically get a copy button
- Messages are stored in the `messages` array in the frontend
- Typing animation adds 8-12ms per character for natural feel
- Response delay simulates real processing (300-1000ms)

---

**Happy chatting!** 🎉
