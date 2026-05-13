const { Server } = require('socket.io');

/**
 * Socket.io Service
 * Provides real-time updates to the frontend
 */

let io = null;

/**
 * Initialize Socket.io with the HTTP server
 */
function initializeSocket(httpServer) {
  const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
    });
  });

  return io;
}

/**
 * Get the Socket.io instance
 */
function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

/**
 * Emit a new message event to all connected clients
 */
function emitNewMessage(message) {
  if (io) {
    io.emit('new-message', message);
  }
}

/**
 * Emit a connection status update
 */
function emitConnectionStatus(status) {
  if (io) {
    io.emit('connection-status', status);
  }
}

module.exports = {
  initializeSocket,
  getIO,
  emitNewMessage,
  emitConnectionStatus
};
