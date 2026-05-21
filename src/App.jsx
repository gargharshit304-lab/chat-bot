import { useEffect, useMemo, useRef, useState } from 'react';
import { Menu, Sparkles, SquarePen } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatArea from './components/ChatArea';
import ChatInput from './components/ChatInput';

function createMessage(role, content, extra = {}) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
    timestamp: new Date(),
    ...extra
  };
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('ACE ready');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef(null);
  const messagesRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const hasMessages = messages.length > 0;

  const onNewChat = () => {
    setMessages([]);
    setStatus('ACE ready');
    setIsTyping(false);
    messagesRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage = createMessage('user', trimmed);
    setMessages((current) => [...current, userMessage]);
    setStatus('ACE is thinking...');
    setIsTyping(true);

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: trimmed })
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      const reply = data.reply || 'Sorry, I could not generate a response.';

      setMessages((current) => [
        ...current,
        createMessage('assistant', reply)
      ]);
      setStatus('ACE ready');
    } catch (error) {
      setMessages((current) => [
        ...current,
        createMessage('assistant', 'Error: Could not reach the server.')
      ]);
      setStatus('ACE connection error');
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const quickActions = useMemo(() => ([
    { label: 'New chat', icon: SquarePen, onClick: onNewChat },
    { label: 'Toggle sidebar', icon: Menu, onClick: () => setSidebarOpen((value) => !value) },
    { label: 'Focus design', icon: Sparkles, onClick: () => {} }
  ]), []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-black text-white antialiased">
      <div className="flex h-full w-full overflow-hidden bg-black">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNewChat={onNewChat}
          quickActions={quickActions}
        />

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden border-l border-white/5 bg-[#000000]">
          <Header
            status={status}
            hasMessages={hasMessages}
            onToggleSidebar={() => setSidebarOpen((value) => !value)}
          />

          <ChatArea
            messages={messages}
            isTyping={isTyping}
            messagesRef={messagesRef}
            bottomRef={bottomRef}
            onNewChat={onNewChat}
          />

          <ChatInput onSend={sendMessage} />
        </main>
      </div>
    </div>
  );
}
