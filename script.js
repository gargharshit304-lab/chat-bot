// Beginner-friendly AI chat frontend using vanilla JS
// - Stores messages in `messages` array
// - Sends user message to backend POST /chat
// - Shows typing animation and loading state

const messages = [];

const el = {
  chatsList: document.getElementById('chatsList'),
  messages: document.getElementById('messages-container'),
  emptyState: document.getElementById('empty-state'),
  inputForm: document.getElementById('inputForm'),
  input: document.getElementById('input'),
  sendBtn: document.getElementById('sendBtn'),
  newChat: document.getElementById('newChat'),
  status: document.getElementById('status')
};

// Utility: Auto-resize textarea
function autoResize(elm){
  elm.style.height = 'auto';
  elm.style.height = Math.min(elm.scrollHeight, 200) + 'px';
}

el.input.addEventListener('input', (e)=> autoResize(e.target));

function syncEmptyState(){
  if(!el.emptyState) return;
  el.emptyState.hidden = messages.length > 0;
}

// Add message locally and render
function pushMessage(role, content){
  const msg = { role, content, time: new Date().toLocaleTimeString() };
  messages.push(msg);
  syncEmptyState();
  renderMessage(msg);
}

function createAvatar(role){
  const avatar = document.createElement('div');
  avatar.className = 'avatar';

  if(role === 'ai'){
    avatar.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v4M12 17v4M4.5 12h4M15.5 12h4M7.2 7.2l2.8 2.8M14 14l2.8 2.8M16.8 7.2L14 10M10 14l-2.8 2.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="2.5" stroke="currentColor" stroke-width="1.7"/></svg>';
  } else {
    avatar.textContent = 'U';
  }

  return avatar;
}

// Render a single message to the DOM
function renderMessage(msg){
  const container = document.createElement('div');
  container.className = 'msg ' + (msg.role === 'user' ? 'user-msg' : 'ai-msg');

  const bubble = document.createElement('div');
  bubble.className = 'bubble ' + (msg.role === 'user' ? 'user' : 'ai');
  bubble.style.opacity = 0;

  // Parse content for code fences (```)
  const parts = splitCodeBlocks(msg.content);
  parts.forEach(part => {
    if(part.type === 'text'){
      const p = document.createElement('div');
      p.innerHTML = escapeHtml(part.content).replace(/\n/g, '<br>');
      bubble.appendChild(p);
    } else {
      const wrapper = document.createElement('div'); wrapper.className = 'pre-wrap';
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.textContent = part.content;
      pre.appendChild(code);
      wrapper.appendChild(pre);
      // copy button
      const copy = document.createElement('button');
      copy.className = 'code-copy';
      copy.textContent = 'Copy';
      copy.addEventListener('click', ()=>{
        navigator.clipboard.writeText(part.content).then(()=>{
          copy.textContent = 'Copied';
          setTimeout(()=>copy.textContent='Copy',1200);
        }).catch(()=>{ copy.textContent = 'Error'; });
      });
      wrapper.appendChild(copy);
      bubble.appendChild(wrapper);
    }
  });

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.innerHTML = `<span class="time">${msg.time}</span>`;
  bubble.appendChild(meta);

  if(msg.role === 'ai'){
    container.appendChild(createAvatar('ai'));
  }
  container.appendChild(bubble);
  el.messages.appendChild(container);
  // animate in
  requestAnimationFrame(()=>{
    bubble.style.transition = 'opacity .28s ease, transform .28s ease';
    bubble.style.opacity = 1;
    bubble.style.transform = 'translateY(0)';
  });
  scrollToBottom();
}

// Split message into text and code fence parts
function splitCodeBlocks(text){
  const parts = [];
  const codeFence = /```(?:\w+)?([\s\S]*?)```/g;
  let lastIndex = 0;
  let m;
  while((m = codeFence.exec(text)) !== null){
    if(m.index > lastIndex){
      parts.push({type:'text',content:text.slice(lastIndex,m.index)});
    }
    parts.push({type:'code',content:m[1].trim()});
    lastIndex = m.index + m[0].length;
  }
  if(lastIndex < text.length){
    parts.push({type:'text',content:text.slice(lastIndex)});
  }
  return parts;
}

// Basic HTML escaping
function escapeHtml(unsafe){
  return unsafe.replace(/[&<>"']/g, function(m){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[m];});
}

// Smooth scroll
function scrollToBottom(){
  el.messages.scrollTo({top: el.messages.scrollHeight, behavior: 'smooth'});
}

// Typing effect for AI reply: gradually append characters
async function typeReply(text, containerBubble){
  containerBubble.innerHTML = ''; // clear typing container
  const pre = document.createElement('div');
  pre.style.whiteSpace = 'pre-wrap';
  containerBubble.appendChild(pre);
  for(let i=0;i<text.length;i++){
    pre.textContent += text[i];
    if(i%10===0) scrollToBottom();
    await new Promise(r=>setTimeout(r, 8 + Math.random()*12));
  }
}

// Show a temporary typing indicator bubble
function showTyping(){
  const container = document.createElement('div');
  container.className = 'msg ai-msg typing-msg';
  const avatar = createAvatar('ai');
  const bubble = document.createElement('div'); bubble.className='bubble ai';
  bubble.innerHTML = '<span class="dots"><span></span><span></span><span></span></span>';
  container.appendChild(avatar); container.appendChild(bubble);
  el.messages.appendChild(container);
  scrollToBottom();
  return container;
}

// Remove typing indicator
function removeTyping(ind){
  if(ind && ind.parentNode) ind.parentNode.removeChild(ind);
}

// Send message to backend
async function sendMessage(text){
  // push user message immediately
  pushMessage('user', text);
  el.input.value = '';
  autoResize(el.input);

  // show typing
  el.sendBtn.disabled = true;
  el.status.textContent = 'AI is typing...';
  const typingNode = showTyping();

  try{
    const res = await fetch('http://localhost:3000/chat', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({message: text})
    });
    if(!res.ok) throw new Error(`Server ${res.status}`);
    const data = await res.json();
    const reply = data.reply ?? 'Sorry, no reply.';

    // render AI reply with typing effect
    removeTyping(typingNode);
    const aiMsg = {role:'ai', content:'' , time:new Date().toLocaleTimeString()};
    messages.push(aiMsg);
    syncEmptyState();

    // create DOM elements for AI and then type into bubble
    const container = document.createElement('div');
    container.className = 'msg ai-msg';
    const avatar = createAvatar('ai');
    const bubble = document.createElement('div'); bubble.className='bubble ai';
    container.appendChild(avatar); container.appendChild(bubble);
    el.messages.appendChild(container);
    scrollToBottom();

    await typeReply(reply, bubble);
    // after typing, parse code blocks & replace bubble content with proper nodes
    messages[messages.length-1].content = reply;
    const finalBubble = document.createElement('div'); finalBubble.className='bubble ai';
    const parts = splitCodeBlocks(reply);
    parts.forEach(part=>{
      if(part.type==='text'){
        const d = document.createElement('div'); d.innerHTML = escapeHtml(part.content).replace(/\n/g,'<br>'); finalBubble.appendChild(d);
      } else {
        const wrapper = document.createElement('div'); wrapper.className='pre-wrap';
        const pre = document.createElement('pre'); const code = document.createElement('code'); code.textContent = part.content; pre.appendChild(code); wrapper.appendChild(pre);
        const copy = document.createElement('button'); copy.className='code-copy'; copy.textContent='Copy'; copy.addEventListener('click', ()=>{ navigator.clipboard.writeText(part.content).then(()=>{ copy.textContent='Copied'; setTimeout(()=>copy.textContent='Copy',1000); }); });
        wrapper.appendChild(copy); finalBubble.appendChild(wrapper);
      }
    });
    const meta = document.createElement('div'); meta.className='meta'; meta.innerHTML = `<span class="time">${aiMsg.time}</span>`; finalBubble.appendChild(meta);
    container.replaceChild(finalBubble, bubble);

    el.status.textContent = 'Ready';
  }catch(err){
    removeTyping(typingNode);
    el.status.textContent = 'Error';
    pushMessage('ai', 'Error: Could not reach server.');
    console.error(err);
  }finally{
    el.sendBtn.disabled = false;
  }
}

// Handle form submit and Enter key behavior
el.inputForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const text = el.input.value.trim();
  if(!text) return;
  sendMessage(text);
});

// Support Enter to send, Shift+Enter for newline
el.input.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter' && !e.shiftKey){
    e.preventDefault();
    el.inputForm.requestSubmit();
  }
});

// New chat clears messages
el.newChat.addEventListener('click', ()=>{
  messages.length = 0;
  el.messages.innerHTML = '';
  el.chatsList.innerHTML = '<div class="empty">No previous chats — start a conversation</div>';
  syncEmptyState();
});

// Initialize with a friendly system message
// Do not add sample messages — keep the UI clean and empty.
// Accessibility: focus input on load
syncEmptyState();
el.input.focus();
