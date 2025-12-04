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

console.log(`📁 Frontend dist path: ${frontendDistPath}`);

// Serve static files (CSS, JS, images, etc.)
app.use(express.static(frontendDistPath, {
  maxAge: '1y',
  etag: false
}));

// SPA fallback: ALL non-API routes go to index.html
app.get('*', (req, res) => {
  console.log(`📍 Routing ${req.path} to index.html`);
  res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
    if (err) {
      console.error(`❌ Error serving index.html for ${req.path}:`, err.message);
      res.status(500).send('Server error');
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
║  Frontend: ✅ Served from dist/                          ║
║  Backend: ✅ API on /api                                 ║
║  Socket.io: ✅ Enabled                                    ║
╚══════════════════════════════════════════════════════════╝
  `);
});

export default app;
