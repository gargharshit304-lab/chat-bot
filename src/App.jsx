import { useEffect, useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatArea from './components/ChatArea';
import ChatInput from './components/ChatInput';

const CHAT_STORAGE_KEY = 'ace.chat-history.v1';

function createChat(title = 'New Chat', model = '') {
  const now = Date.now();

  return {
    id: crypto.randomUUID(),
    title,
    model,
    createdAt: now,
    updatedAt: now,
    messages: []
  };
}

function createMessage(role, content, extra = {}) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
    timestamp: new Date(),
    ...extra
  };
}

function buildChatMessages(messages) {
  return messages
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .map((message, index, list) => {
      const isLatestAssistantPlaceholder = message.role === 'assistant' && index === list.length - 1 && message.content === 'ACE is thinking...';

      return {
        role: message.role,
        content: isLatestAssistantPlaceholder ? '' : message.content
      };
    })
    .filter((message) => message.content !== '' || message.role === 'user');
}

function loadChats() {
  if (typeof window === 'undefined') {
    return [createChat()];
  }

  try {
    const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) {
      return [createChat()];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [createChat()];
    }

    return parsed.map((chat) => ({
      id: chat.id || crypto.randomUUID(),
      title: chat.title || 'New Chat',
      model: chat.model || '',
      createdAt: chat.createdAt || Date.now(),
      updatedAt: chat.updatedAt || Date.now(),
      messages: Array.isArray(chat.messages) ? chat.messages : []
    }));
  } catch {
    return [createChat()];
  }
}

export default function App() {
  const [chats, setChats] = useState(() => loadChats());
  const [activeChatId, setActiveChatId] = useState(() => loadChats()[0]?.id || crypto.randomUUID());
  const [status, setStatus] = useState('ACE ready');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ollamaConnected, setOllamaConnected] = useState(false);
  const [ollamaMessage, setOllamaMessage] = useState('Checking local models...');
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(() => window.localStorage.getItem('ace.selectedModel') || '');
  const bottomRef = useRef(null);
  const messagesRef = useRef(null);

  const activeChat = chats.find((chat) => chat.id === activeChatId) || chats[0];
  const messages = activeChat?.messages || [];
  const resolvedModel = models.find((model) => model.name === selectedModel)?.name || models[0]?.name || '';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!activeChat && chats.length > 0) {
      setActiveChatId(chats[0].id);
    }
  }, [activeChat, chats]);

  useEffect(() => {
    if (activeChat?.model && activeChat.model !== selectedModel) {
      setSelectedModel(activeChat.model);
    }
  }, [activeChat?.id, activeChat?.model, selectedModel]);

  useEffect(() => {
    if (selectedModel) {
      window.localStorage.setItem('ace.selectedModel', selectedModel);
    }
  }, [selectedModel]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chats));
  }, [chats]);

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
        } else {
          setSelectedModel('');
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

  const updateActiveChat = (updater) => {
    setChats((currentChats) => currentChats.map((chat) => {
      if (chat.id !== activeChatId) {
        return chat;
      }

      return typeof updater === 'function' ? updater(chat) : updater;
    }));
  };

  const createNewChat = () => {
    const nextChat = createChat('New Chat', resolvedModel);
    setChats((currentChats) => [nextChat, ...currentChats]);
    setActiveChatId(nextChat.id);
    setStatus('ACE ready');
    setIsTyping(false);
    messagesRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renameChat = (chatId, nextTitle) => {
    const trimmedTitle = nextTitle.trim();
    if (!trimmedTitle) {
      return;
    }

    setChats((currentChats) => currentChats.map((chat) => (
      chat.id === chatId
        ? { ...chat, title: trimmedTitle.slice(0, 64), updatedAt: Date.now() }
        : chat
    )));
  };

  const deleteChat = (chatId) => {
    setChats((currentChats) => {
      if (currentChats.length <= 1) {
        const fallbackChat = createChat('New Chat', resolvedModel);
        setActiveChatId(fallbackChat.id);
        setStatus('ACE ready');
        return [fallbackChat];
      }

      const nextChats = currentChats.filter((chat) => chat.id !== chatId);
      if (activeChatId === chatId) {
        setActiveChatId(nextChats[0]?.id || crypto.randomUUID());
      }

      return nextChats;
    });

    setIsTyping(false);
  };

  const switchChat = (chatId) => {
    const nextChat = chats.find((chat) => chat.id === chatId);
    setActiveChatId(chatId);
    if (nextChat?.model) {
      setSelectedModel(nextChat.model);
    }
    setIsTyping(false);
    messagesRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectModelForActiveChat = (modelName) => {
    setSelectedModel(modelName);
    updateActiveChat((chat) => ({
      ...chat,
      model: modelName,
      updatedAt: Date.now()
    }));
  };

  const updateAssistantMessage = (messageId, content) => {
    updateActiveChat((chat) => ({
      ...chat,
      updatedAt: Date.now(),
      messages: chat.messages.map((message) => (
        message.id === messageId
          ? { ...message, content }
          : message
      ))
    }));
  };

  const renameChatFromMessages = (chat, nextMessages) => {
    if (chat.title !== 'New Chat' || nextMessages.length === 0) {
      return chat;
    }

    const firstUserMessage = nextMessages.find((message) => message.role === 'user');
    if (!firstUserMessage) {
      return chat;
    }

    const trimmedTitle = firstUserMessage.content.trim();
    return {
      ...chat,
      title: trimmedTitle.length > 36 ? `${trimmedTitle.slice(0, 36).trim()}…` : trimmedTitle || 'New Chat'
    };
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

    if (!resolvedModel) {
      setStatus('Select a local model first');
      return;
    }

    const userMessage = createMessage('user', trimmed);
    const assistantId = `assistant-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    updateActiveChat((chat) => {
      const nextMessages = [...chat.messages, userMessage, createMessage('assistant', 'ACE is thinking...', { id: assistantId })];

      return renameChatFromMessages({
        ...chat,
        updatedAt: Date.now(),
        model: resolvedModel,
        messages: nextMessages
      }, nextMessages);
    });

    setStatus(`Generating with ${resolvedModel}`);
    setIsTyping(true);

    try {
      const conversation = buildChatMessages([...messages, userMessage]);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: resolvedModel,
          messages: conversation,
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

          const chunkText = parsed?.message?.content || parsed?.response || '';

          if (chunkText) {
            if (!accumulated) {
              updateAssistantMessage(assistantId, '');
            }
            accumulated += chunkText;
            updateAssistantMessage(assistantId, accumulated);
          }
        }
      }

      const finalChunk = parseStreamChunk(buffer);
      const finalText = finalChunk?.message?.content || finalChunk?.response || '';
      if (finalText) {
        accumulated += finalText;
      }

      updateAssistantMessage(assistantId, accumulated || 'No response received from Ollama.');
      setStatus(`${resolvedModel} ready`);
    } catch (error) {
      const message = error.message.includes('timed out')
        ? 'The selected model is still loading. Try again in a moment.'
        : error.message;

      updateAssistantMessage(assistantId, `Error: ${message}`);
      setStatus(message.includes('loading') ? 'Model loading' : 'ACE connection error');
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-black text-white antialiased">
      <div className="flex h-full w-full overflow-hidden bg-black">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNewChat={createNewChat}
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={switchChat}
          onRenameChat={renameChat}
          onDeleteChat={deleteChat}
        />

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden border-l border-white/5 bg-[#000000]">
          <Header
            status={status}
            hasMessages={hasMessages}
            selectedModel={selectedModel}
            ollamaConnected={ollamaConnected}
            onToggleSidebar={() => setSidebarOpen((value) => !value)}
            activeChatTitle={activeChat?.title || 'New Chat'}
          />

          <ChatArea
            messages={messages}
            isTyping={isTyping}
            messagesRef={messagesRef}
            bottomRef={bottomRef}
            onNewChat={createNewChat}
          />

          <ChatInput
            onSend={sendMessage}
            disabled={isTyping || !resolvedModel}
            models={models}
            selectedModel={resolvedModel || selectedModel}
            onSelectModel={selectModelForActiveChat}
            ollamaConnected={ollamaConnected}
          />
        </main>
      </div>
    </div>
  );
}
