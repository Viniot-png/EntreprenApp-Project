import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';
import { 
  initializeSocket, 
  getSocket, 
  disconnectSocket, 
  onEvent, 
  offEvent,
  emitEvent 
} from '@/lib/socket';

/**
 * Hook pour utiliser Socket.io
 * - Initialise automatiquement avec l'ID utilisateur
 * - Gère la connexion/déconnexion
 * - Fournit des méthodes pour émettre et écouter des événements
 */
export const useSocket = () => {
  const { user } = useAuth();
  const socketRef = useRef(getSocket());
  const listenersRef = useRef<Map<string, any>>(new Map());

  // Initialiser Socket.io quand l'utilisateur est disponible
  useEffect(() => {
    if (user && user._id) {
      try {
        const socket = initializeSocket(user._id);
        socketRef.current = socket;
        console.log('[useSocket] Socket initialized for user:', user._id);
      } catch (error) {
        console.error('[useSocket] Failed to initialize socket:', error);
      }
    }

    return () => {
      // Ne pas déconnecter ici, laisser la session active
    };
  }, [user]);

  // Émettre un événement
  const emit = useCallback((event: string, data?: any) => {
    emitEvent(event, data);
  }, []);

  // Écouter un événement (avec cleanup automatique)
  const on = useCallback((event: string, callback: (data: any) => void) => {
    onEvent(event, callback);
    
    // Stocker pour cleanup plus tard
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, []);
    }
    listenersRef.current.get(event).push(callback);
  }, []);

  // Arrêter d'écouter un événement
  const off = useCallback((event: string, callback?: (data: any) => void) => {
    offEvent(event, callback);
    
    if (listenersRef.current.has(event) && callback) {
      const callbacks = listenersRef.current.get(event);
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }, []);

  // Obtenir le statut de connexion
  const isConnected = socketRef.current?.connected ?? false;

  return {
    socket: socketRef.current,
    emit,
    on,
    off,
    isConnected
  };
};
