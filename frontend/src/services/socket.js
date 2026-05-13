import { io } from 'socket.io-client';

/**
 * Socket Service
 * Handles real-time connection to the backend.
 *
 * In dev: VITE_API_URL is empty, so we connect to localhost:5000 directly
 * (Vite proxies /socket.io too, but socket.io-client works fine either way).
 *
 * In production: set VITE_API_URL to the deployed backend origin, e.g.
 * VITE_API_URL=https://instavs-backend.up.railway.app
 */

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket = null;

/**
 * Initialize socket connection
 */
export function connectSocket() {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    withCredentials: true
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  return socket;
}

/**
 * Get current socket instance
 */
export function getSocket() {
  return socket;
}

/**
 * Disconnect socket
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
