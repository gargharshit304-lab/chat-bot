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
  const [ollamaConnected, setOllamaConnected] = useState(false);
  const [ollamaMessage, setOllamaMessage] = useState('Checking local models...');
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(() => window.localStorage.getItem('ace.selectedModel') || '');
  const bottomRef = useRef(null);
  const messagesRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (selectedModel) {
      window.localStorage.setItem('ace.selectedModel', selectedModel);
    }
  }, [selectedModel]);

  useEffect(() => {
    let cancelled = false;

    const loadModels = async () => {
      try {
        const response = await fetch('/api/ollama/models');
        const data = await response.json();

        if (cancelled) {
          return;
        }

        const nextModels = Array.isArray(data.models) ? data.models : [];
        setModels(nextModels);
        setOllamaConnected(Boolean(data.connected));
        setOllamaMessage(data.connected ? `Connected to ${data.baseUrl || 'Ollama'}` : 'Ollama is not running');

        if (nextModels.length > 0) {
          setSelectedModel((current) => {
            if (current && nextModels.some((model) => model.name === current)) {
              return current;
            }

            const storedModel = window.localStorage.getItem('ace.selectedModel');
            if (storedModel && nextModels.some((model) => model.name === storedModel)) {
              return storedModel;
            }

            return nextModels[0].name;
          });
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        setModels([]);
        setOllamaConnected(false);
        setOllamaMessage('Unable to reach Ollama');
        console.error(error);
      }
    };

    loadModels();
    const interval = window.setInterval(loadModels, 10000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const hasMessages = messages.length > 0;

  const onNewChat = () => {
    setMessages([]);
    setStatus('ACE ready');
    setIsTyping(false);
    messagesRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateAssistantMessage = (messageId, content) => {
    setMessages((current) => current.map((message) => (
      message.id === messageId
        ? { ...message, content }
        : message
    )));
  };

  const parseStreamChunk = (chunk) => {
    const trimmed = chunk.trim();
    if (!trimmed || trimmed === '[DONE]') {
      return null;
    }

    const payload = trimmed.startsWith('data:') ? trimmed.slice(5).trim() : trimmed;
    if (!payload) {
      return null;
    }

    try {
      return JSON.parse(payload);
    } catch {
      return null;
    }
  };

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    if (!selectedModel) {
      setStatus('Select a local model first');
      return;
    }

    const userMessage = createMessage('user', trimmed);
    const assistantId = `assistant-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setMessages((current) => [...current, userMessage, createMessage('assistant', '', { id: assistantId })]);
    setStatus(`Generating with ${selectedModel}`);
    setIsTyping(true);

    try {
      const response = await fetch('/api/ollama/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: trimmed,
          stream: true
        })
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || `Request failed with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Streaming response is not available');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const parsed = parseStreamChunk(line);
          if (!parsed) {
            continue;
          }

          if (parsed.response) {
            accumulated += parsed.response;
            updateAssistantMessage(assistantId, accumulated);
          }
        }
      }

      const finalChunk = parseStreamChunk(buffer);
      if (finalChunk?.response) {
        accumulated += finalChunk.response;
      }

      updateAssistantMessage(assistantId, accumulated || 'No response received from Ollama.');
      setStatus(`${selectedModel} ready`);
    } catch (error) {
      updateAssistantMessage(assistantId, `Error: ${error.message}`);
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
        />

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden border-l border-white/5 bg-[#000000]">
          <Header
            status={status}
            hasMessages={hasMessages}
            selectedModel={selectedModel}
            ollamaConnected={ollamaConnected}
            onToggleSidebar={() => setSidebarOpen((value) => !value)}
          />

          <ChatArea
            messages={messages}
            isTyping={isTyping}
            messagesRef={messagesRef}
            bottomRef={bottomRef}
            onNewChat={onNewChat}
          />

          <ChatInput
            onSend={sendMessage}
            disabled={isTyping || !selectedModel}
            models={models}
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
            ollamaConnected={ollamaConnected}
          />
        </main>
      </div>
    </div>
  );
}
