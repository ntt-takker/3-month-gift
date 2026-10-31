import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);

// Persistence directory
const DATA_DIR = path.join(__dirname, 'data');
const STATE_FILE = path.join(DATA_DIR, 'shared_couple_state.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory state cache
let sharedState: Record<string, unknown> = {};

// Helper to deduplicate chat messages by ID
function deduplicateChat(list: any[]): any[] {
  if (!Array.isArray(list)) return [];
  const seen = new Set<string>();
  const result: any[] = [];
  for (const item of list) {
    if (item && item.id && !seen.has(item.id)) {
      seen.add(item.id);
      result.push(item);
    }
  }
  return result;
}

if (fs.existsSync(STATE_FILE)) {
  try {
    const raw = fs.readFileSync(STATE_FILE, 'utf-8');
    sharedState = JSON.parse(raw);
    if (Array.isArray(sharedState.chat)) {
      sharedState.chat = deduplicateChat(sharedState.chat);
    }
  } catch (err) {
    console.error('Failed reading existing state file:', err);
  }
}

function persistState() {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(sharedState, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed persisting shared state:', err);
  }
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  app.use(express.json({ limit: '15mb' }));

  // WebSocket Server for instantaneous real-time sync across devices
  const wss = new WebSocketServer({ server });

  const broadcast = (data: object, sender?: WebSocket) => {
    const message = JSON.stringify(data);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client !== sender) {
        client.send(message);
      }
    });
  };

  wss.on('connection', (ws: WebSocket) => {
    // Send full current synced state upon connection
    ws.send(JSON.stringify({ type: 'SYNC_FULL_STATE', payload: sharedState }));

    ws.on('message', (messageRaw: string) => {
      try {
        const message = JSON.parse(messageRaw.toString());
        if (message.type === 'UPDATE_STATE') {
          // Merge state
          const nextState = { ...sharedState, ...message.payload };
          if (Array.isArray(nextState.chat)) {
            nextState.chat = deduplicateChat(nextState.chat);
          }
          sharedState = nextState;
          persistState();
          // Broadcast to all other clients
          broadcast({ type: 'STATE_UPDATED', payload: message.payload }, ws);
        } else if (message.type === 'CHAT_MESSAGE') {
          const chatList = Array.isArray(sharedState.chat) ? [...sharedState.chat] : [];
          const newMsg = message.payload;
          if (newMsg && newMsg.id && !chatList.some((m: any) => m.id === newMsg.id)) {
            chatList.push(newMsg);
            sharedState.chat = chatList;
            persistState();
            broadcast({ type: 'CHAT_MESSAGE_RECEIVED', payload: newMsg }, ws);
          }
        } else if (message.type === 'SEND_POKE') {
          broadcast({ type: 'POKE_RECEIVED', payload: message.payload }, ws);
        }
      } catch (err) {
        console.error('WebSocket message handling error:', err);
      }
    });
  });

  // REST endpoints for fallback and initial hydration
  app.get('/api/state', (_req, res) => {
    res.json(sharedState);
  });

  app.post('/api/state', (req, res) => {
    const nextState = { ...sharedState, ...req.body };
    if (Array.isArray(nextState.chat)) {
      nextState.chat = deduplicateChat(nextState.chat);
    }
    sharedState = nextState;
    persistState();
    broadcast({ type: 'STATE_UPDATED', payload: req.body });
    res.json({ success: true, timestamp: Date.now() });
  });

  app.post('/api/chat', (req, res) => {
    const chatList = Array.isArray(sharedState.chat) ? [...sharedState.chat] : [];
    const newMsg = req.body;
    if (newMsg && newMsg.id && !chatList.some((m: any) => m.id === newMsg.id)) {
      chatList.push(newMsg);
      sharedState.chat = chatList;
      persistState();
      broadcast({ type: 'CHAT_MESSAGE_RECEIVED', payload: newMsg });
    }
    res.json({ success: true, message: req.body });
  });

  // In development, hook Vite middleware
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist static files
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`MS Verse Couple Sanctuary server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
