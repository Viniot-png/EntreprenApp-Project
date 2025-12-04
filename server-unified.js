/**
 * UNIFIED SERVER
 * Sert à la fois le backend Express ET le frontend React (SPA)
 * Toutes les requêtes /api vont au backend
 * Toutes les autres routes vont au frontend (React Router)
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';

// Load environment variables
dotenv.config({ path: '.env', override: false });

// Backend imports
import { validateEnv } from './EntreprenApp-Backend/utils/validateEnv.js';
import { validateConfig } from './EntreprenApp-Backend/utils/validateConfig.js';
import { initializeCloudinary } from './EntreprenApp-Backend/utils/cloudinaryHelpers.js';
import { errorHandler, notFoundHandler } from './EntreprenApp-Backend/middlewares/errorHandler.js';
import { DbConnection } from './EntreprenApp-Backend/dbConfig/Db.js';

// Middleware imports
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';

// Routes imports
import authRoute from './EntreprenApp-Backend/routes/auth.route.js';
import postRoute from './EntreprenApp-Backend/routes/post.route.js';
import commentRoute from './EntreprenApp-Backend/routes/comment.route.js';
import friendRoute from './EntreprenApp-Backend/routes/friend.route.js';
import eventRoute from './EntreprenApp-Backend/routes/event.route.js';
import projectRoute from './EntreprenApp-Backend/routes/project.route.js';
import challengeRoute from './EntreprenApp-Backend/routes/challenge.route.js';
import messageRoute from './EntreprenApp-Backend/routes/message.route.js';
import notificationRoute from './EntreprenApp-Backend/routes/notification.route.js';
import suggestionsRoute from './EntreprenApp-Backend/routes/suggestions.route.js';
import searchRoute from './EntreprenApp-Backend/routes/search.route.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate environment
validateEnv();
validateConfig();
initializeCloudinary();

// Connect to database
DbConnection();

// Create Express app
const app = express();
const server = http.createServer(app);

// Timeouts
server.timeout = 120000;
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

// CORS configuration
const corsOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080',
  process.env.FRONTEND_URL || 'http://localhost:5173'
];

const corsOptions = {
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200
};

// Middleware setup
app.use(cors(corsOptions));

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: corsOrigins,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  },
});

global.onlineUsers = new Map();
global.io = io;

// ============ SOCKET.IO LOGGING & AUTHENTICATION ============
io.on('connection', (socket) => {
  console.log(`✅ [Socket] New client connected: ${socket.id}`);
  console.log(`   User ID: ${socket.handshake.query.userId || 'Anonymous'}`);
  console.log(`   Headers: ${JSON.stringify(socket.handshake.headers)}`);
  
  const userId = socket.handshake.query.userId;
  if (userId) {
    global.onlineUsers.set(userId, socket.id);
    console.log(`   ✅ User ${userId} added to onlineUsers. Total online: ${global.onlineUsers.size}`);
  }

  // Listen for events
  socket.on('disconnect', (reason) => {
    console.log(`❌ [Socket] Client disconnected: ${socket.id}`);
    console.log(`   Reason: ${reason}`);
    console.log(`   User ID: ${userId || 'Anonymous'}`);
    
    if (userId) {
      global.onlineUsers.delete(userId);
      console.log(`   ✅ User ${userId} removed from onlineUsers. Total online: ${global.onlineUsers.size}`);
    }
  });

  socket.on('error', (error) => {
    console.error(`🔴 [Socket] Error on ${socket.id}:`, error);
  });
});

// ============ HTTP REQUEST LOGGING ============
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const status = res.statusCode;
    const statusEmoji = status >= 200 && status < 300 ? '✅' : status >= 300 && status < 400 ? '🔵' : status >= 400 && status < 500 ? '⚠️' : '🔴';
    
    console.log(`${statusEmoji} [HTTP] ${req.method} ${req.path} → ${status} (${duration}ms)`);
    
    if (status >= 400) {
      console.log(`   Headers: ${JSON.stringify(req.headers)}`);
      console.log(`   Body: ${JSON.stringify(req.body).substring(0, 200)}`);
    }
  });
  
  next();
});

app.set('trust proxy', 1);
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 2000 : 500,
  message: 'Too many authentication attempts, please try again later.',
  skip: (req) => process.env.NODE_ENV === 'development',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return process.env.NODE_ENV === 'production'
      ? (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(',')[0].trim()
      : req.connection.remoteAddress;
  }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10000 : 5000,
  skip: (req) => process.env.NODE_ENV === 'development',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return process.env.NODE_ENV === 'production'
      ? (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(',')[0].trim()
      : req.connection.remoteAddress;
  }
});

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(hpp({
  whitelist: [
    'duration',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price'
  ]
}));
app.use(compression());

// Backend API routes
console.log('🔗 Mounting API routes...');
app.use('/api/auth', authRoute);
app.use('/api/event', eventRoute);
app.use('/api/message', messageRoute);
app.use('/api/post', postRoute);
app.use('/api/comment', commentRoute);
app.use('/api/friend', friendRoute);
app.use('/api/project', projectRoute);
app.use('/api/challenge', challengeRoute);
app.use('/api/notification', notificationRoute);
app.use('/api/suggestions', suggestionsRoute);
app.use('/api/search', searchRoute);

// Swagger docs
app.get('/api-docs', (req, res) => {
  res.json({ message: 'API documentation would be here' });
});

// ========================
// FRONTEND (SPA) Routes
// ========================

const frontendDistPath = path.join(__dirname, 'entreprenapp-frontend', 'dist');

console.log(`\n📁 Frontend Configuration:`);
console.log(`   Dist path: ${frontendDistPath}`);

// Verify frontend files exist
import fs from 'fs';
const indexHtmlPath = path.join(frontendDistPath, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  console.log(`   ✅ index.html found`);
} else {
  console.error(`   ❌ index.html NOT found at ${indexHtmlPath}`);
  console.error(`   Frontend build might be missing. Run: npm run build in entreprenapp-frontend/`);
}

const distExists = fs.existsSync(frontendDistPath);
console.log(`   Dist directory: ${distExists ? '✅ exists' : '❌ missing'}`);

if (distExists) {
  const files = fs.readdirSync(frontendDistPath).slice(0, 10);
  console.log(`   Files in dist: ${files.join(', ')}${files.length > 10 ? '...' : ''}`);
}

// Serve static files (CSS, JS, images, etc.) with proper cache headers
app.use(express.static(frontendDistPath, {
  maxAge: '24h',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Cache assets (JS, CSS, fonts, images) for a long time
    if (path.match(/\.(js|css|woff2|woff|ttf|eot|png|jpg|jpeg|gif|svg|ico|webp)$/i)) {
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
    }
    // Don't cache HTML files - always revalidate
    else if (path.endsWith('.html')) {
      res.set('Cache-Control', 'no-cache, must-revalidate, max-age=0');
      res.set('Pragma', 'no-cache');
    }
  }
}));

// SPA fallback: Route non-API, non-asset requests to index.html
app.all(/.*/, (req, res, next) => {
  // Skip if it's an API route
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // Skip if it's a file with an extension
  if (/\.\w+$/.test(req.path)) {
    return next();
  }
  
  // Skip if it looks like a directory request (common false asset paths)
  if (req.path.match(/^\/(public|static|assets|images|fonts|uploads|admin)\b/i)) {
    return next();
  }
  
  const indexPath = path.join(frontendDistPath, 'index.html');
  console.log(`📍 [SPA] Routing to index.html: ${req.method} ${req.path}`);
  
  res.sendFile(indexPath, (err) => {
    if (err && err.code !== 'ECONNABORT') {
      console.error(`❌ [SPA] Error serving index.html:`, err.message);
      return res.status(500).send('Server error');
    }
  });
});

// Error handlers
app.use(errorHandler);
app.use(notFoundHandler);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║     🚀 EntreprenApp Unified Server Started              ║
╠══════════════════════════════════════════════════════════╣
║  Port: ${PORT}                                              ║
║  Environment: ${process.env.NODE_ENV}                                   ║
║  Hostname: 0.0.0.0                                       ║
║                                                          ║
║  ✅ Frontend: Served from dist/                         ║
║  ✅ Backend: API routes on /api                         ║
║  ✅ Socket.io: Enabled with logging                     ║
║  ✅ CORS: Configured for ${corsOrigins.length} origins                ║
║                                                          ║
║  📍 Routes:                                             ║
║     GET  /*        → index.html (SPA routing)          ║
║     POST /api/*    → Backend API                       ║
║     WS   /socket   → Socket.io                         ║
║                                                          ║
║  🔍 Logging enabled for:                               ║
║     • HTTP requests with status codes                  ║
║     • Socket.io connections/disconnections             ║
║     • SPA routing attempts                             ║
║     • Errors and warnings                              ║
╚══════════════════════════════════════════════════════════╝
  `);
  console.log(`Access your app at: http://localhost:${PORT}\n`);
});

process.on('unhandledRejection', (err) => {
  console.error('🔴 [Unhandled Rejection]:', err);
});

process.on('uncaughtException', (err) => {
  console.error('🔴 [Uncaught Exception]:', err);
  process.exit(1);
});

export default app;
