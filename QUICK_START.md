# 🚀 Quick Start Guide

Get your AI chatbot running in 5 minutes!

## Step 1: Install Dependencies (1 min)

Open PowerShell in your project folder and run:

```powershell
npm install
```

**Expected output:**
```
added 50 packages in 2s
```

---

## Step 2: Start the Backend (30 sec)

```powershell
npm start
```

**Expected output:**
```
🚀 AI Chatbot Backend is running on http://localhost:3000
📝 Send POST requests to http://localhost:3000/chat
💡 Request body: { "message": "your message" }
✨ Response: { "reply": "AI response" }
```

✅ **Keep this terminal open!**

---

## Step 3: Open the Frontend (30 sec)

1. Open `index.html` in your browser, OR
2. Use Live Server:
   - Right-click `index.html` → "Open with Live Server"

**Expected:**
You should see the AI Chat interface with a text input field.

---

## Step 4: Test It! (1 min)

Try typing these messages in the chat:

- `"Hello"`
- `"How are you?"`
- `"What time is it?"`
- `"Show me a code example"`

✅ You should see:
1. Your message appears instantly ✨
2. Typing indicator with animated dots ...
3. AI response appears in a bubble 💬
4. Timestamp on each message ⏰

---

## 🎯 What's Working

✅ Frontend displays messages  
✅ Backend responds to requests  
✅ Typing animation  
✅ Auto-scroll  
✅ Timestamps  
✅ Code blocks with copy button  
✅ Error handling  
✅ Smooth animations  

---

## 🔧 Next Steps

### Option A: Use Rule-Based Responses
Already working! The server includes smart responses for:
- "Hello", "Hi", "How are you?"
- "What time is it?", "What's the date?"
- "Show me code", "Show me markdown"
- ... and more!

### Option B: Add Real AI (5 min)

Follow the **API_INTEGRATION_GUIDE.md** to add:
- 🟡 **OpenAI (GPT-4)** - Best quality
- 🟦 **Google Gemini** - Best value  
- 🟣 **Anthropic Claude** - Most advanced
- 🔮 **Ollama** - Free local AI

---

## 🛑 Troubleshooting

### Backend won't start
```powershell
# Check if port 3000 is in use
netstat -ano | findstr 3000

# Kill the process if needed
taskkill /PID <PID> /F

# Or use a different port
$env:PORT=3001; npm start
```

### Frontend can't reach backend
- ✅ Backend must be running on `http://localhost:3000`
- ✅ Browser console shows any errors
- ✅ Check CORS is enabled (it is by default)

### No response from server
- ✅ Check backend is running
- ✅ Check no error in browser console
- ✅ Try refreshing the page

---

## 📝 File Overview

| File | Purpose |
|------|---------|
| `index.html` | Chat UI (HTML) |
| `script.js` | Chat logic (Vanilla JS) |
| `style.css` | Styling (Dark theme) |
| `server.js` | Backend API (Express) |
| `package.json` | Dependencies |
| `.env` | Configuration |
| `README.md` | Full documentation |
| `API_INTEGRATION_GUIDE.md` | AI service integration |

---

## 🎨 Customization Tips

### Change port
Edit `.env`:
```
PORT=3001
```

### Disable response delay
Edit `server.js`, find:
```javascript
setTimeout(() => {
  res.json({ reply });
}, 300 + Math.random() * 700);
```

Remove the setTimeout and just:
```javascript
res.json({ reply });
```

### Add custom responses
Edit `generateAIResponse()` in `server.js`:
```javascript
if (lowerMessage.includes('custom question')) {
  return 'Your custom answer here!';
}
```

### Change theme colors
Edit `style.css`:
```css
:root {
  --accent-from: #7c3aed;  /* Change from purple */
  --accent-to: #06b6d4;     /* Change to cyan */
}
```

---

## ✨ Features Highlight

### Frontend
- 📱 Responsive design (works on mobile)
- 🌙 Dark mode theme
- ✍️ Auto-expanding textarea
- ↩️ Enter to send, Shift+Enter for newline
- 📟 Code blocks with syntax highlighting
- 📋 Copy-to-clipboard for code
- ⏰ Message timestamps
- 🎬 Smooth animations
- ♿ Accessible (ARIA labels)

### Backend
- 🚀 Fast Express.js server
- 🔗 CORS enabled
- ✔️ Input validation
- 🔄 Error handling
- ⚡ Response delay simulation
- 📝 Easy to customize

---

## 🎓 Learning Path

1. **Week 1**: Get it running (you are here!)
2. **Week 2**: Customize responses in `server.js`
3. **Week 3**: Add real AI using API_INTEGRATION_GUIDE.md
4. **Week 4**: Add database to store messages
5. **Week 5**: Deploy to production

---

## 🆘 Still Need Help?

1. Check browser console (F12 → Console)
2. Check terminal for errors
3. Look at API_INTEGRATION_GUIDE.md
4. Read README.md for full documentation

---

## 🎉 You're All Set!

**Happy chatting!**

Next: Follow the API integration guide to add real AI, or customize the current responses to suit your needs.

---

**Need more features?** See README.md for advanced setup!
