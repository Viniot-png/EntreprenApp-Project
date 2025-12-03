import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.VITE_API_URL || 'http://localhost:3000';

let socket: Socket | null = null;

/**
 * Initialiser la connexion Socket.io
 */
export const initializeSocket = (userId: string): Socket => {
  if (socket) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      userId,
      token: localStorage.getItem('token')
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling']
  });

  // Connection events
  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('error', (error) => {
    console.error('[Socket] Error:', error);
  });

  return socket;
};

/**
 * Obtenir l'instance Socket actuelle
 */
export const getSocket = (): Socket | null => {
  return socket;
};

/**
 * Fermer la connexion Socket.io
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Émettre un événement
 */
export const emitEvent = (event: string, data?: any): void => {
  if (socket && socket.connected) {
    socket.emit(event, data);
  } else {
    console.warn('[Socket] Socket not connected, cannot emit:', event);
  }
};

/**
 * Écouter un événement
 */
export const onEvent = (event: string, callback: (data: any) => void): void => {
  if (socket) {
    socket.on(event, callback);
  }
};

/**
 * Arrêter d'écouter un événement
 */
export const offEvent = (event: string, callback?: (data: any) => void): void => {
  if (socket) {
    if (callback) {
      socket.off(event, callback);
    } else {
      socket.off(event);
    }
  }
};

// ============================================
// ÉVÉNEMENTS SOCKET.IO PRÉDÉFINIS
// ============================================

/**
 * Événements messages
 */
export const messageEvents = {
  // Client → Server
  SEND_MESSAGE: 'message:send',
  TYPING: 'message:typing',
  
  // Server → Client
  NEW_MESSAGE: 'message:new',
  MESSAGE_UPDATED: 'message:updated',
  MESSAGE_DELETED: 'message:deleted',
  USER_TYPING: 'message:user-typing'
};

/**
 * Événements notifications
 */
export const notificationEvents = {
  // Client → Server
  READ_NOTIFICATION: 'notification:read',
  
  // Server → Client
  NEW_NOTIFICATION: 'notification:new',
  NOTIFICATION_DELETED: 'notification:deleted'
};

/**
 * Événements utilisateurs
 */
export const userEvents = {
  // Server → Client
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  USERS_ONLINE: 'users:online-list'
};

/**
 * Événements commentaires (bonus)
 */
export const commentEvents = {
  // Client → Server
  ADD_COMMENT: 'comment:add',
  EDIT_COMMENT: 'comment:edit',
  DELETE_COMMENT: 'comment:delete',
  
  // Server → Client
  COMMENT_ADDED: 'comment:added',
  COMMENT_UPDATED: 'comment:updated',
  COMMENT_REMOVED: 'comment:removed'
};
