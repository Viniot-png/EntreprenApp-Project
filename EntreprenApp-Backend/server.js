import express from 'express';
import dotenv from 'dotenv';
import { validateEnv } from './utils/validateEnv.js';
import { validateConfig } from './utils/validateConfig.js';
import { initializeCloudinary } from './utils/cloudinaryHelpers.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import cors from 'cors'
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import hpp from 'hpp';
import rateLimit from "express-rate-limit"
import { DbConnection } from './dbConfig/Db.js';
import authRoute from './routes/auth.route.js';
import postRoute from './routes/post.route.js';
import commentRoute from './routes/comment.route.js';
import friendRoute from './routes/friend.route.js';
import eventRoute from './routes/event.route.js';
import { Server } from "socket.io";   
import projectRoute from './routes/project.route.js';
import { swaggerUi, swaggerSpec } from './swagger.js';
import challengeRoute from './routes/challenge.route.js';
import http from "http";   
import messageRoute from './routes/message.route.js';
import notificationRoute from './routes/notification.route.js';
import suggestionsRoute from './routes/suggestions.route.js';
import searchRoute from './routes/search.route.js';


dotenv.config();
validateEnv();
validateConfig();
initializeCloudinary();

const app = express();

const server = http.createServer(app);  

// Augmenter les timeouts pour les uploads Cloudinary
server.timeout = 60000; // 60 secondes pour les uploads


app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8080',
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://entrepreneurapp-frontend.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200
}));


// --- Socket.IO Setup ---
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
    credentials: true
  },
});

// Keep a map of online users: userId -> socketId
global.onlineUsers = new Map();
// Expose io globally so controllers can emit events after REST actions
global.io = io;


app.use(helmet());


if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


// Rate limits:
// Keep login/register endpoints stricter to prevent brute-force attacks,
// but allow higher limits for authenticated API endpoints (friends, messages, etc.).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 500, // Production: 100 req/15min per IP (6 req/min), Dev: 500
  message: 'Too many authentication attempts, please try again later.',
  skip: (req) => process.env.NODE_ENV === 'development', // Skip rate limiting in development
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 500 : 5000, // Production: 500 req/15min per IP (33 req/min), Dev: 5000
  skip: (req) => process.env.NODE_ENV === 'development', // Skip rate limiting in development
  standardHeaders: true,
  legacyHeaders: false,
});

// Attach specific limiters to paths: auth endpoints stricter, rest of API more permissive
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


app.get('/', (req, res) => {
  res.send('<h1 style="font-weight: bolder">WELL DONE!</h1>');
});

app.use('/api/auth',authRoute);
app.use('/api/event',eventRoute);
app.use('/api/message',messageRoute);
app.use('/api/notification',notificationRoute);
app.use('/api/challenge',challengeRoute);
app.use('/api/project',projectRoute);
app.use('/api/post',postRoute);
app.use('/api/comment',commentRoute);
app.use('/api/friend',friendRoute);
app.use('/api/suggestions',suggestionsRoute);
app.use('/api/search',searchRoute);

app.use('/api-entreprenapp', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404 Handler - AVANT le error handler global
app.use(notFoundHandler);

// Global Error Handler - DERNIER middleware
app.use(errorHandler);


// --- Socket.IO Namespace Setup ---
io.on("connection", (socket) => {
  console.log("[Socket] New client connected:", socket.id);

  // ============================================
  // CONNECTION EVENTS
  // ============================================

  /**
   * Événement d'authentification et rejoindre
   * Client envoie userId pour enregistrer la connexion
   */
  socket.on("user:join", (data) => {
    try {
      const userId = data?.userId;
      if (userId) {
        // Enregistrer l'utilisateur comme connecté
        global.onlineUsers.set(userId, {
          socketId: socket.id,
          connectedAt: new Date()
        });
        
        console.log(`[Socket] User joined: ${userId} (socket: ${socket.id})`);
        
        // Joindre une room personnelle pour les notifications
        socket.join(`user:${userId}`);
        
        // Broadcaster la liste des utilisateurs connectés
        const onlineUserIds = Array.from(global.onlineUsers.keys());
        io.emit('users:online-list', onlineUserIds);
        
        // Confirmer la connexion
        socket.emit('connection:success', { userId, socketId: socket.id });
      }
    } catch (err) {
      console.error('[Socket] Error handling user:join event', err);
      socket.emit('error', { message: 'Erreur de connexion' });
    }
  });

  // ============================================
  // MESSAGE EVENTS
  // ============================================

  /**
   * Envoyer un message
   */
  socket.on("message:send", (data) => {
    try {
      console.log("[Socket] New message:", data);
      
      // Broadcaster à tous les clients
      socket.broadcast.emit("message:new", {
        ...data,
        receivedAt: new Date()
      });
      
      // Confirmation au sender
      socket.emit("message:sent", { 
        id: data.id,
        status: 'sent',
        timestamp: new Date()
      });
    } catch (err) {
      console.error('[Socket] Error handling message:send', err);
    }
  });

  /**
   * Utilisateur en train de taper
   */
  socket.on("message:typing", (data) => {
    try {
      // Broadcaster à tous SAUF l'émetteur
      socket.broadcast.emit("message:user-typing", {
        userId: data.userId,
        username: data.username,
        timestamp: new Date()
      });
    } catch (err) {
      console.error('[Socket] Error handling message:typing', err);
    }
  });

  /**
   * Message mise à jour
   */
  socket.on("message:update", (data) => {
    try {
      io.emit("message:updated", {
        ...data,
        updatedAt: new Date()
      });
    } catch (err) {
      console.error('[Socket] Error handling message:update', err);
    }
  });

  /**
   * Message suppression
   */
  socket.on("message:delete", (data) => {
    try {
      io.emit("message:deleted", {
        messageId: data.messageId,
        deletedAt: new Date()
      });
    } catch (err) {
      console.error('[Socket] Error handling message:delete', err);
    }
  });

  // ============================================
  // NOTIFICATION EVENTS
  // ============================================

  /**
   * Envoyer une notification à un utilisateur spécifique
   */
  socket.on("notification:send", (data) => {
    try {
      const targetUserId = data.targetUserId;
      console.log(`[Socket] Notification to user ${targetUserId}:`, data);
      
      // Envoyer à la room de l'utilisateur cible
      io.to(`user:${targetUserId}`).emit("notification:new", {
        ...data,
        receivedAt: new Date()
      });
    } catch (err) {
      console.error('[Socket] Error handling notification:send', err);
    }
  });

  /**
   * Marquer une notification comme lue
   */
  socket.on("notification:read", (data) => {
    try {
      io.emit("notification:read", {
        notificationId: data.notificationId,
        readAt: new Date()
      });
    } catch (err) {
      console.error('[Socket] Error handling notification:read', err);
    }
  });

  /**
   * Supprimer une notification
   */
  socket.on("notification:delete", (data) => {
    try {
      io.emit("notification:deleted", {
        notificationId: data.notificationId,
        deletedAt: new Date()
      });
    } catch (err) {
      console.error('[Socket] Error handling notification:delete', err);
    }
  });

  // ============================================
  // COMMENT EVENTS (Real-time comments)
  // ============================================

  /**
   * Nouveau commentaire
   */
  socket.on("comment:add", (data) => {
    try {
      console.log("[Socket] New comment:", data);
      io.emit("comment:added", {
        ...data,
        createdAt: new Date()
      });
    } catch (err) {
      console.error('[Socket] Error handling comment:add', err);
    }
  });

  /**
   * Commentaire modifié
   */
  socket.on("comment:edit", (data) => {
    try {
      io.emit("comment:updated", {
        ...data,
        updatedAt: new Date()
      });
    } catch (err) {
      console.error('[Socket] Error handling comment:edit', err);
    }
  });

  /**
   * Commentaire supprimé
   */
  socket.on("comment:delete", (data) => {
    try {
      io.emit("comment:removed", {
        commentId: data.commentId,
        postId: data.postId,
        deletedAt: new Date()
      });
    } catch (err) {
      console.error('[Socket] Error handling comment:delete', err);
    }
  });

  // ============================================
  // DISCONNECTION
  // ============================================

  socket.on("disconnect", () => {
    console.log("[Socket] Client disconnected:", socket.id);
    
    try {
      // Trouver et supprimer l'utilisateur de la liste des connectés
      let disconnectedUserId = null;
      for (const [userId, data] of global.onlineUsers.entries()) {
        if (data.socketId === socket.id) {
          disconnectedUserId = userId;
          global.onlineUsers.delete(userId);
          console.log(`[Socket] User ${userId} went offline`);
          break;
        }
      }

      // Broadcaster la liste mise à jour
      const onlineUserIds = Array.from(global.onlineUsers.keys());
      io.emit('users:online-list', onlineUserIds);
      
      // Notifier si c'est pertinent
      if (disconnectedUserId) {
        io.emit('user:offline', { 
          userId: disconnectedUserId,
          disconnectedAt: new Date()
        });
      }
    } catch (err) {
      console.error('[Socket] Error during disconnect cleanup', err);
    }
  });

  // ============================================
  // ERROR HANDLING
  // ============================================

  socket.on('error', (error) => {
    console.error('[Socket] Error:', error);
    socket.emit('error', { message: 'Une erreur est survenue' });
  });
});

// ============================================
// UTILITY FUNCTIONS FOR CONTROLLERS
// ============================================

/**
 * Émettre une notification à tous les utilisateurs connectés
 */
global.emitToAll = (event, data) => {
  if (global.io) {
    global.io.emit(event, data);
  }
};

/**
 * Émettre une notification à un utilisateur spécifique
 */
global.emitToUser = (userId, event, data) => {
  if (global.io) {
    global.io.to(`user:${userId}`).emit(event, data);
  }
};

/**
 * Obtenir la liste des utilisateurs connectés
 */
global.getOnlineUsers = () => {
  return Array.from(global.onlineUsers.keys());
};

/**
 * Vérifier si un utilisateur est connecté
 */
global.isUserOnline = (userId) => {
  return global.onlineUsers.has(userId);
};


const port = process.env.PORT;

server.listen(port, async () => {
  console.log(`Your server is running on port ${port}.`);
  await DbConnection();
});


