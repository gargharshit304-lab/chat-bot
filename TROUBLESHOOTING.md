# 🔧 Troubleshooting Guide

## Installation Issues

### npm install fails

**Error**: `npm ERR! code ERESOLVE`

**Solution**:
```powershell
# Clear npm cache
npm cache clean --force

# Try installing again
npm install

# If still fails, use legacy peer deps
npm install --legacy-peer-deps
```

---

### Port 3000 already in use

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Note the PID number and kill it
taskkill /PID <PID_NUMBER> /F

# Or use different port
$env:PORT=3001
npm start
```

**Or in Windows PowerShell (better way):**
```powershell
# Kill all node processes
Get-Process node | Stop-Process -Force

# Start server
npm start
```

---

## Backend Issues

### Backend won't start

**Symptoms**: Terminal shows an error

**Check 1**: Node.js installed?
```powershell
node --version  # Should show v14.0.0 or higher
npm --version   # Should show 6.0.0 or higher
```

**Check 2**: Dependencies installed?
```powershell
ls node_modules  # Should show many folders

# If empty, run:
npm install
```

**Check 3**: Syntax error in server.js?
```powershell
# Check for errors
node server.js
```

---

### "Cannot find module 'express'"

**Error**: `Error: Cannot find module 'express'`

**Solution**:
```powershell
# Install dependencies
npm install

# Verify installation
ls node_modules | grep express  # Should show "express"
```

---

### Server running but not responding

**Symptoms**: Browser shows "Cannot connect to server"

**Check 1**: Is backend actually running?
```powershell
# Should see: 🚀 AI Chatbot Backend is running...
npm start
```

**Check 2**: Correct URL in frontend?
- Open `script.js`
- Search for: `fetch('http://localhost:3000/chat'`
- Should be correct

**Check 3**: Firewall blocking?
```powershell
# Windows Firewall - add exception for Node.js
# Or temporarily disable for testing
```

---

## Frontend Issues

### Page shows blank

**Symptoms**: Browser shows blank page or errors

**Solution 1**: Open browser console (F12)
```
Press: F12 → Console tab
Look for red errors
```

**Solution 2**: Check file paths
```html
<!-- In index.html, verify paths are correct -->
<link rel="stylesheet" href="style.css">  ✓ Same folder
<script src="script.js" defer></script>    ✓ Same folder
```

**Solution 3**: Clear cache
```
Press: Ctrl + Shift + Del
Clear all cache
Reload page: Ctrl + R
```

---

### Send button doesn't work

**Symptoms**: Clicking Send does nothing

**Check 1**: Open browser console (F12)
```
Look for red errors
Common errors:
- "Cannot POST /chat"
- "Failed to fetch"
- "CORS error"
```

**Check 2**: Backend running?
```
Terminal should show:
"🚀 AI Chatbot Backend is running on http://localhost:3000"
```

**Check 3**: JavaScript syntax error?
```powershell
# Check script.js for errors
# Look for red squiggly lines in VS Code
```

---

### Messages not appearing

**Symptoms**: Type message, nothing appears

**Check 1**: Console for errors
- F12 → Console
- Look for red text

**Check 2**: Input field empty?
- Try typing more than just spaces
- Spaces are trimmed

**Check 3**: Check messages array
```javascript
// Open browser console and type:
messages

// Should show array of messages
```

---

### Typing indicator not showing

**Symptoms**: Send button freezes but no "..." animation

**Check 1**: CSS is loaded
- F12 → Elements
- Check if `.dots` element has styling

**Check 2**: Script running
- F12 → Console
- Try: `console.log(messages)`
- Should print message array

---

## API/Network Issues

### CORS Error: "Access to XMLHttpRequest blocked"

**Error**: `Cross-Origin Request Blocked`

**Solution**: Backend has CORS enabled by default
- If error persists, restart backend
- Clear browser cache
- Try in private/incognito mode

```powershell
# Restart backend
Ctrl+C  # Stop backend
npm start  # Restart
```

---

### "Failed to fetch" or connection refused

**Symptoms**: Network error in browser console

**Causes**:
1. Backend not running
2. Wrong URL in script.js
3. Port mismatch

**Check**:
```javascript
// In browser console:
fetch('http://localhost:3000')
  .then(r => r.json())
  .then(d => console.log(d))
  .catch(e => console.error(e))

// Should print: {status: "Server is running", message: "..."}
```

---

### Slow responses

**Symptoms**: AI takes >5 seconds to respond

**Causes**:
- Network latency
- Server processing delay (intentional, 300-1000ms)
- External API slow (if using OpenAI, etc.)

**Solution**:
```javascript
// In server.js, reduce delay:

// Change from:
setTimeout(() => res.json({ reply }), 300 + Math.random() * 700);

// To:
res.json({ reply });  // Remove delay entirely
```

---

## Display/UI Issues

### Messages not scrolling to bottom

**Symptoms**: New messages appear off-screen

**Solution**:
```javascript
// In browser console, test scroll:
document.getElementById('messages').scrollTop = 
  document.getElementById('messages').scrollHeight;

// If works but auto-scroll doesn't, check:
// - scrollToBottom() function
// - CSS scroll-behavior: smooth
```

---

### Styling looks broken

**Symptoms**: Page looks ugly, colors wrong, layout broken

**Solution**:
```powershell
# Hard refresh browser
Ctrl + Shift + R  # Windows/Linux
Cmd + Shift + R   # Mac

# Or clear cache:
F12 → Settings → Clear site data
```

---

### Code block copy button doesn't work

**Symptoms**: Click copy, nothing happens

**Check 1**: Browser supports clipboard
```javascript
// In console:
navigator.clipboard  // Should exist
```

**Check 2**: Verify button element
- F12 → Elements
- Find `.code-copy` button
- Click it and check console

---

## Performance Issues

### Page slow/laggy

**Check 1**: Too many messages?
- Send 50+ messages
- Page gets slower
- Solution: Limit message history or use pagination

**Check 2**: Animations stuttering
- Reduce animation time in CSS
- Or disable animations:
```css
.msg { animation: none; }
```

---

### High CPU usage

**Symptoms**: Fan spinning, computer hot

**Causes**:
- Heavy animations
- Infinite loops
- Too many setTimeouts

**Solution**:
```javascript
// Check for infinite loops in console
// Restart terminal with Ctrl+C
// Restart browser
```

---

## Data/Storage Issues

### Messages disappear on refresh

**Symptoms**: Reload page, all messages gone

**This is normal!** Messages are only in memory.

**Solution**: Add localStorage:
```javascript
// Save messages
localStorage.setItem('messages', JSON.stringify(messages));

// Load messages on startup
const saved = localStorage.getItem('messages');
if (saved) messages = JSON.parse(saved);
```

---

## Advanced Debugging

### Enable detailed logging

**Option 1**: Edit server.js
```javascript
app.post('/chat', (req, res) => {
  console.log('📨 Request received:', req.body);
  console.log('⏰ Time:', new Date().toISOString());
  
  // ... rest of code
  
  console.log('📤 Sending response:', reply);
  res.json({ reply });
});
```

**Option 2**: Edit script.js
```javascript
async function sendMessage(text) {
  console.log('🔵 Sending message:', text);
  
  try {
    const res = await fetch('http://localhost:3000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    
    console.log('🟢 Response status:', res.status);
    const data = await res.json();
    console.log('💬 AI reply:', data.reply);
    
  } catch (err) {
    console.error('🔴 Error:', err);
  }
}
```

---

### Check Network in Developer Tools

1. Open F12 → Network tab
2. Send a message
3. Look for POST request to `localhost:3000/chat`
4. Click it → Preview/Response tabs

**Expected**:
- Status: 200
- Response: `{ "reply": "..." }`

---

## Reinstalling Everything

If nothing works, start fresh:

```powershell
# 1. Stop any running processes
Get-Process node | Stop-Process -Force

# 2. Clean npm cache
npm cache clean --force

# 3. Delete node_modules and package-lock.json
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force

# 4. Reinstall
npm install

# 5. Start fresh
npm start
```

---

## Testing with curl

Test backend without frontend:

```powershell
# Test if server is running
curl http://localhost:3000

# Test /chat endpoint
curl -X POST http://localhost:3000/chat `
  -H "Content-Type: application/json" `
  -d '{"message":"hello"}'
```

**Expected responses:**
```json
// First: {"status":"Server is running","message":"AI Chatbot Backend is active"}

// Second: {"reply":"Hey there! How can I help you today?"}
```

---

## Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| `EADDRINUSE` | Port in use | Kill process or change port |
| `Cannot find module` | Package not installed | `npm install` |
| `SyntaxError` | Code error | Check syntax in VS Code |
| `Cannot POST /chat` | Typo in fetch URL | Check URL matches `/chat` |
| `CORS error` | Cross-origin blocked | Backend CORS already enabled |
| `Failed to fetch` | Network error | Check backend running |
| `Undefined is not a function` | Function not defined | Check script.js loaded |

---

## Getting Help

1. **Check console first**: F12 → Console (Most helpful!)
2. **Read the error**: Error messages are usually very clear
3. **Check README.md**: Full documentation
4. **Check ARCHITECTURE.md**: How things work
5. **Restart everything**: Terminal + Browser
6. **Reinstall**: `npm install` then `npm start`

---

## Still Stuck?

Create a minimal test:

```javascript
// In browser console, test backend connection:
fetch('http://localhost:3000/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'test' })
})
.then(r => r.json())
.then(data => console.log('SUCCESS:', data))
.catch(err => console.error('ERROR:', err))
```

**If this works**: Frontend bug
**If this fails**: Backend issue

---

Good luck! You got this! 🚀
