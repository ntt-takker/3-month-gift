/**
 * Real-time 24/7 Synchronization Client for the Couple App
 * Connects via WebSockets to server with fallback to BroadcastChannel and REST API.
 */

import { soundEngine } from './audio';

type SyncListener = (event: { type: string; payload: any }) => void;

class SyncService {
  private ws: WebSocket | null = null;
  private listeners: Set<SyncListener> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private isConnected: boolean = false;
  private reconnectTimer: number | null = null;

  constructor() {
    // Setup local multi-tab broadcast channel
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('us_couple_sync_channel');
        this.broadcastChannel.onmessage = (event) => {
          this.notifyListeners(event.data);
        };
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }
  }

  public init() {
    if (typeof window === 'undefined') return;
    this.connect();
    // Fetch latest initial state from REST API
    this.fetchInitialState();
  }

  private connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyListeners(data);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.isConnected = false;
        this.scheduleReconnect();
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 4000);
  }

  private async fetchInitialState() {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        if (Object.keys(data).length > 0) {
          this.notifyListeners({ type: 'SYNC_FULL_STATE', payload: data });
        }
      }
    } catch {
      // Offline or network error
    }
  }

  private notifyListeners(event: { type: string; payload: any }) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Listener notification error:', err);
      }
    });
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public sendStateUpdate(key: string, data: any) {
    const payload = { [key]: data };
    const event = { type: 'UPDATE_STATE', payload };

    // Broadcast locally to tabs
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(event);
      } catch {}
    }

    // Send via WebSocket
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(event));
      } catch (e) {
        console.error('WS send error:', e);
      }
    }

    // Also persist via REST for offline/server persistence
    fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }

  public sendChatMessage(message: any) {
    const event = { type: 'CHAT_MESSAGE', payload: message };

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'CHAT_MESSAGE_RECEIVED', payload: message });
      } catch {}
    }

    let sentViaWs = false;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(event));
        sentViaWs = true;
      } catch (e) {
        console.error('WS send error:', e);
      }
    }

    if (!sentViaWs) {
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      }).catch(() => {});
    }
  }

  public sendPoke(from: string, to: string, pokeType: 'hug' | 'kiss' | 'love') {
    const event = { type: 'SEND_POKE', payload: { from, to, pokeType, timestamp: Date.now() } };
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'POKE_RECEIVED', payload: event.payload });
      } catch {}
    }
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(event));
      } catch {}
    }
  }

  public getStatus() {
    return this.isConnected;
  }
}

export const syncService = new SyncService();
