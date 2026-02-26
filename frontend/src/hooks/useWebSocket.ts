'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  getWebSocketInstance,
  type WsMessage,
  type WsMessageType,
  type WebSocketConfig,
} from '@/lib/websocket';

enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
}

export interface UseWebSocketOptions extends WebSocketConfig {
  /**
   * Automatically connect on mount
   * @default true
   */
  autoConnect?: boolean;

  /**
   * Specific message types to listen for (if not provided, listens to all)
   */
  messageTypes?: WsMessageType[];

  /**
   * Callback for when messages are received
   */
  onMessage?: (message: WsMessage) => void;

  /**
   * Callback for when connection is established
   */
  onConnect?: () => void;

  /**
   * Callback for when connection is closed
   */
  onDisconnect?: () => void;

  /**
   * Callback for when an error occurs
   */
  onError?: (error: string) => void;
}

export interface UseWebSocketReturn {
  /**
   * Whether the WebSocket is currently connected
   */
  isConnected: boolean;

  /**
   * The connection ID (if connected)
   */
  connectionId: string | null;

  /**
   * Most recent message received
   */
  lastMessage: WsMessage | null;

  /**
   * Manually connect to the WebSocket
   */
  connect: () => void;

  /**
   * Manually disconnect from the WebSocket
   */
  disconnect: () => void;

  /**
   * Send a ping to the server
   */
  ping: () => void;
}

/**
 * React hook for using the Stellar Insights WebSocket connection
 */
export function useWebSocket(
  options: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const {
    autoConnect = true,
    messageTypes,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    ...wsConfig
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<WsMessage | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    ConnectionState.DISCONNECTED
  );

  const wsRef = useRef(getWebSocketInstance(wsConfig));
  const unsubscribersRef = useRef<Array<() => void>>([]);
  const isConnectingRef = useRef(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const shouldReconnectRef = useRef(true);
  const maxReconnectAttempts = wsConfig.maxReconnectAttempts || 5;

  // Handle message callback
  const handleMessage = useCallback(
    (message: WsMessage) => {
      setLastMessage(message);

      // Update connection state
      if (message.type === 'connected') {
        setIsConnected(true);
        setConnectionId(message.connection_id);
        setConnectionState(ConnectionState.CONNECTED);
        isConnectingRef.current = false;
        reconnectAttemptsRef.current = 0;
        onConnect?.();
      }

      // Handle errors
      if (message.type === 'error') {
        onError?.(message.message);
      }

      // Call user-provided message handler
      onMessage?.(message);
    },
    [onMessage, onConnect, onError]
  );

  // Connect to WebSocket
  const connect = useCallback(() => {
    const ws = wsRef.current;

    // Prevent duplicate connections
    if (isConnectingRef.current) {
      return;
    }

    // Check if already connected
    if (ws.isConnected()) {
      return;
    }

    isConnectingRef.current = true;
    setConnectionState(ConnectionState.CONNECTING);

    // Clear any existing subscriptions
    unsubscribersRef.current.forEach((unsub) => unsub());
    unsubscribersRef.current = [];

    // Subscribe to messages
    if (messageTypes && messageTypes.length > 0) {
      messageTypes.forEach((type) => {
        const unsub = ws.on(type, handleMessage);
        unsubscribersRef.current.push(unsub);
      });
    } else {
      // Subscribe to all message types
      const unsub = ws.onAny(handleMessage);
      unsubscribersRef.current.push(unsub);
    }

    // Add error handler for connection failures
    const errorUnsub = ws.on('error', () => {
      isConnectingRef.current = false;
      setConnectionState(ConnectionState.DISCONNECTED);
    });
    unsubscribersRef.current.push(errorUnsub);

    // Connect
    try {
      ws.connect();
    } catch (error) {
      isConnectingRef.current = false;
      setConnectionState(ConnectionState.DISCONNECTED);
      console.error('Failed to connect:', error);
    }

    // Check connection status periodically
    const checkInterval = setInterval(() => {
      const connected = ws.isConnected();
      setIsConnected(connected);

      if (connected) {
        setConnectionId(ws.getConnectionId());
        if (connectionState !== ConnectionState.CONNECTED) {
          setConnectionState(ConnectionState.CONNECTED);
          isConnectingRef.current = false;
        }
      } else {
        setConnectionId(null);
        if (
          connectionState === ConnectionState.CONNECTED ||
          connectionState === ConnectionState.CONNECTING
        ) {
          // Connection lost, attempt reconnect
          if (
            shouldReconnectRef.current &&
            reconnectAttemptsRef.current < maxReconnectAttempts
          ) {
            scheduleReconnect();
          } else {
            setConnectionState(ConnectionState.DISCONNECTED);
            isConnectingRef.current = false;
          }
        }
      }
    }, 1000);

    // Store interval for cleanup
    unsubscribersRef.current.push(() => {
      clearInterval(checkInterval);
    });
  }, [messageTypes, handleMessage, connectionState, maxReconnectAttempts]);

  // Schedule reconnection with exponential backoff and jitter
  const scheduleReconnect = useCallback(() => {
    // Clear existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Check if we should reconnect
    if (
      !shouldReconnectRef.current ||
      reconnectAttemptsRef.current >= maxReconnectAttempts
    ) {
      setConnectionState(ConnectionState.DISCONNECTED);
      isConnectingRef.current = false;
      return;
    }

    reconnectAttemptsRef.current++;
    setConnectionState(ConnectionState.RECONNECTING);

    // Exponential backoff with jitter
    const baseDelay = 1000;
    const exponentialDelay = baseDelay * Math.pow(2, reconnectAttemptsRef.current - 1);
    const jitter = Math.random() * 1000;
    const delay = Math.min(exponentialDelay + jitter, 30000); // Max 30s

    reconnectTimeoutRef.current = setTimeout(() => {
      isConnectingRef.current = false;
      connect();
    }, delay);
  }, [connect, maxReconnectAttempts]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    const ws = wsRef.current;

    shouldReconnectRef.current = false;
    isConnectingRef.current = false;

    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Unsubscribe from all events
    unsubscribersRef.current.forEach((unsub) => unsub());
    unsubscribersRef.current = [];

    // Disconnect
    ws.disconnect();

    setIsConnected(false);
    setConnectionId(null);
    setConnectionState(ConnectionState.DISCONNECTED);
    reconnectAttemptsRef.current = 0;

    onDisconnect?.();
  }, [onDisconnect]);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    // Disconnect first
    disconnect();

    // Reset attempts and enable reconnect
    reconnectAttemptsRef.current = 0;
    shouldReconnectRef.current = true;

    // Delay slightly before reconnecting
    setTimeout(() => {
      connect();
    }, 100);
  }, [disconnect, connect]);

  // Send ping
  const ping = useCallback(() => {
    wsRef.current.ping();
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      shouldReconnectRef.current = true;
      connect();
    }

    // Cleanup on unmount
    return () => {
      shouldReconnectRef.current = false;
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    connectionId,
    lastMessage,
    connect: reconnect, // Use reconnect for public API to ensure clean state
    disconnect,
    ping,
  };
}

/**
 * Hook for listening to snapshot updates
 */
export function useSnapshotUpdates(
  onUpdate: (update: Extract<WsMessage, { type: 'snapshot_update' }>) => void
) {
  return useWebSocket({
    messageTypes: ['snapshot_update'],
    onMessage: (message) => {
      if (message.type === 'snapshot_update') {
        onUpdate(message);
      }
    },
  });
}

/**
 * Hook for listening to corridor updates
 */
export function useCorridorUpdates(
  onUpdate: (update: Extract<WsMessage, { type: 'corridor_update' }>) => void
) {
  return useWebSocket({
    messageTypes: ['corridor_update'],
    onMessage: (message) => {
      if (message.type === 'corridor_update') {
        onUpdate(message);
      }
    },
  });
}

/**
 * Hook for listening to anchor updates
 */
export function useAnchorUpdates(
  onUpdate: (update: Extract<WsMessage, { type: 'anchor_update' }>) => void
) {
  return useWebSocket({
    messageTypes: ['anchor_update'],
    onMessage: (message) => {
      if (message.type === 'anchor_update') {
        onUpdate(message);
      }
    },
  });
}
