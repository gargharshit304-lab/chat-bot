const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_CHAT_TIMEOUT_MS = Number(process.env.OLLAMA_CHAT_TIMEOUT_MS || 180000);
const distPath = path.join(__dirname, 'dist');
const hasBuiltFrontend = fs.existsSync(distPath);

// Middleware
app.use(cors());
app.use(express.json());

async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

function formatBytes(bytes) {
  if (typeof bytes !== 'number' || Number.isNaN(bytes)) {
    return 'Unknown size';
  }

  if (bytes === 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / (1024 ** index);

  return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
}

async function readTextResponse(response) {
  try {
    return await response.text();
  } catch (error) {
    return error.message;
  }
}

async function getOllamaStatus() {
  const response = await fetchWithTimeout(`${OLLAMA_BASE_URL}/api/tags`, {}, 3000);

  if (!response.ok) {
    throw new Error(`Ollama responded with ${response.status}`);
  }

  const data = await response.json();
  const psResponse = await fetchWithTimeout(`${OLLAMA_BASE_URL}/api/ps`, {}, 3000).catch(() => null);
  const runningModels = psResponse && psResponse.ok ? await psResponse.json() : { models: [] };
  const runningNames = new Set((runningModels.models || []).map((model) => model.name));

  return {
    connected: true,
    baseUrl: OLLAMA_BASE_URL,
    models: (data.models || []).map((model) => ({
      name: model.name,
      size: model.size,
      sizeLabel: formatBytes(model.size),
      modifiedAt: model.modified_at,
      running: runningNames.has(model.name)
    }))
  };
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', message: 'AI Chatbot Backend is active' });
});

app.get('/api/ollama/status', async (req, res) => {
  try {
    const status = await getOllamaStatus();
    res.json(status);
  } catch (error) {
    res.status(200).json({
      connected: false,
      baseUrl: OLLAMA_BASE_URL,
      models: [],
      error: error.message
    });
  }
});

app.get('/api/ollama/models', async (req, res) => {
  try {
    const status = await getOllamaStatus();
    res.json(status);
  } catch (error) {
    res.status(200).json({
      connected: false,
      baseUrl: OLLAMA_BASE_URL,
      models: [],
      error: error.message
    });
  }
});

function messagesToPrompt(messages) {
  return messages
    .map((message) => {
      const label = message.role === 'assistant' ? 'Assistant' : 'User';
      return `${label}: ${message.content}`;
    })
    .join('\n\n') + '\n\nAssistant:';
}

async function proxyOllamaChat(req, res) {
  try {
    const { model, messages, stream = true } = req.body || {};

    if (!model || typeof model !== 'string') {
      return res.status(400).json({ error: 'model is required' });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages is required and must be a non-empty array' });
    }

    const chatPayload = {
      model,
      messages,
      stream: stream !== false
    };

    let ollamaResponse = await fetchWithTimeout(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(chatPayload)
    }, OLLAMA_CHAT_TIMEOUT_MS);

    if (ollamaResponse.status === 404) {
      const prompt = messagesToPrompt(messages);
      ollamaResponse = await fetchWithTimeout(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          prompt,
          stream: stream !== false
        })
      }, OLLAMA_CHAT_TIMEOUT_MS);
    }

    if (!ollamaResponse.ok) {
      const message = await readTextResponse(ollamaResponse);
      return res.status(ollamaResponse.status).json({
        error: 'Ollama request failed',
        details: message || ollamaResponse.statusText
      });
    }

    if (!stream) {
      return res.json(await ollamaResponse.json());
    }

    res.status(200);
    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    if (!ollamaResponse.body) {
      return res.end();
    }

    Readable.fromWeb(ollamaResponse.body).pipe(res);
  } catch (error) {
    if (error?.name === 'AbortError') {
      return res.status(504).json({
        error: 'Ollama request timed out',
        details: 'The selected model may still be loading. Try again in a moment or keep the model running in Ollama.'
      });
    }

    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

app.post('/api/chat', proxyOllamaChat);
app.post('/api/ollama/generate', proxyOllamaChat);

// Serve the built React app when available
if (hasBuiltFrontend) {
  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
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
  console.log(`📝 Ollama status: http://localhost:${PORT}/api/ollama/status`);
  console.log(`📝 Ollama models: http://localhost:${PORT}/api/ollama/models`);
  console.log(`📝 Ollama chat: POST http://localhost:${PORT}/api/chat`);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('Server shutting down...');
  process.exit(0);
});
