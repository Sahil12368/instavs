require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const socketService = require('./services/socketService');

// Import route files
const authRoutes = require('./routes/authRoutes');
const rulesRoutes = require('./routes/rulesRoutes');
const messagesRoutes = require('./routes/messagesRoutes');

// Import webhook handler
const webhookHandler = require('./webhooks/instagramWebhook');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Trust the reverse proxy (Railway, Render, Fly, etc.) so req.ip and HTTPS
// detection behave correctly behind a load balancer.
app.set('trust proxy', 1);

// Initialize Socket.io
socketService.initializeSocket(server);

// =============================================
// MIDDLEWARE
// =============================================

// CORS - support one or more allowed origins (comma-separated in FRONTEND_URL)
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (curl, server-to-server) with no origin
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true
  })
);

// Parse JSON bodies. Capture the raw body for webhook routes so we can verify
// Meta's X-Hub-Signature-256 header.
app.use(
  express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
      if (req.originalUrl.startsWith('/api/webhook/')) {
        req.rawBody = buf;
      }
    }
  })
);

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// =============================================
// ROUTES
// =============================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Webhook routes (these must be defined before other routes)
app.get('/api/webhook/instagram', webhookHandler.verifyWebhook);
app.post('/api/webhook/instagram', webhookHandler.handleWebhookEvents);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rules', rulesRoutes);
app.use('/api/messages', messagesRoutes);

// =============================================
// ERROR HANDLING
// =============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// =============================================
// DATABASE CONNECTION & SERVER START
// =============================================

const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/instagram-auto-reply';

// Connect to MongoDB and start server
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');

    server.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
      console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Allowed CORS: ${allowedOrigins.join(', ')}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Make sure MongoDB is running on:', MONGODB_URI);
    process.exit(1);
  });

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});
