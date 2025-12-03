import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageService, backendToFrontendMessage, backendToFrontendUser } from '@/lib/api/services';
import type { FrontendUser, FrontendMessage } from '@/lib/api/services';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { API_CONFIG } from '@/lib/api/config';

export interface Conversation {
  id: string;
  participant: FrontendUser;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export const useMessages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversationState] = useState<Conversation | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Récupérer les messages d'une conversation
  const { data: fetchedMessages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages', selectedUserId],
    queryFn: async () => {
      if (!selectedUserId || !user) return [];
      const messages = await messageService.getConversation(selectedUserId);
      return messages.map((msg: any) => backendToFrontendMessage(msg));
    },
    enabled: !!selectedUserId && !!user,
  });

  // Conversations fetched from API
  const { data: fetchedConversations = [], isLoading: isLoadingConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      if (!user) return [];
      const resp = await messageService.getConversations();
      return resp.conversations || [];
    },
    enabled: !!user,
  });

  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Local messages state (synchronisé avec les messages récupérés par react-query)
  const [messages, setMessages] = useState<FrontendMessage[]>(fetchedMessages as FrontendMessage[]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // Sync fetched messages into local state so we can update/delete locally
  useEffect(() => {
    // Only update messages if the fetched messages differ to avoid unnecessary re-renders
    try {
      const oldIds = messages.map(m => m.id).join(',');
      const newIds = (fetchedMessages as FrontendMessage[]).map(m => m.id).join(',');
      if (oldIds !== newIds) {
        setMessages(fetchedMessages as FrontendMessage[]);
      }
    } catch (e) {
      setMessages(fetchedMessages as FrontendMessage[]);
    }
  }, [fetchedMessages, messages]);

  // Mark unread count as 0 when a conversation is selected (separate effect)
  useEffect(() => {
    if (!selectedUserId) return;
    setConversations(prev => {
      let changed = false;
      const next = prev.map(c => {
        if (c.id === selectedUserId && c.unreadCount !== 0) {
          changed = true;
          return { ...c, unreadCount: 0 };
        }
        return c;
      });
      return changed ? next : prev;
    });
  }, [selectedUserId]);

  // Keep conversations in local state
  useEffect(() => {
    if (!fetchedConversations) return;
    const mapped: Conversation[] = (fetchedConversations as any[]).map((c) => ({
      id: c.id,
      participant: backendToFrontendUser(c.participant),
      lastMessage: c.lastMessage || '',
      lastMessageAt: c.lastMessageAt || new Date().toISOString(),
      unreadCount: c.unreadCount || 0,
    }));

    // Avoid replacing conversations array if identical
    try {
      const oldSerialized = conversations.map(x => `${x.id}:${x.unreadCount}`).join('|');
      const newSerialized = mapped.map(x => `${x.id}:${x.unreadCount}`).join('|');
      if (oldSerialized !== newSerialized) {
        setConversations(mapped);
      }
    } catch (e) {
      setConversations(mapped);
    }
  }, [fetchedConversations, conversations]);

  // Socket.IO client (dynamic import so app doesn't crash if package not installed)
  useEffect(() => {
    let socket: any = null;
    let mounted = true;

    const initSocket = async () => {
      if (!user?.id) return;
      try {
        const { io } = await import('socket.io-client');
        // connect to the same host as the API baseURL
        const base = API_CONFIG.baseURL || window.location.origin;
        socket = io(base, { 
          transports: ['websocket'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5
        });

        socket.on('connect', () => {
          if (mounted && user?.id) {
            socket.emit('join', { userId: user.id });
          }
        });

        socket.on('receive_message', (backendMsg: any) => {
          if (!mounted) return;
          try {
            const fmsg = backendToFrontendMessage(backendMsg);
            setMessages(prev => {
              // Avoid duplicates
              if (prev.some((m: any) => m.id === fmsg.id)) return prev;
              return [...prev, fmsg];
            });
          } catch (err) {
            console.error('Error processing receive_message:', err);
          }
        });

        socket.on('message_updated', (backendMsg: any) => {
          if (!mounted) return;
          try {
            const fmsg = backendToFrontendMessage(backendMsg);
            setMessages(prev => prev.map(m => (m.id === fmsg.id ? fmsg : m)));
          } catch (err) {
            console.error('Error processing message_updated:', err);
          }
        });

        socket.on('message_deleted', (payload: any) => {
          if (!mounted) return;
          try {
            setMessages(prev => prev.filter(m => m.id !== payload.id));
          } catch (err) {
            console.error('Error processing message_deleted:', err);
          }
        });

        socket.on('message_sent', (backendMsg: any) => {
          if (!mounted) return;
          try {
            const fmsg = backendToFrontendMessage(backendMsg);
            setMessages(prev => {
              // Avoid duplicates
              if (prev.some((m: any) => m.id === fmsg.id)) return prev;
              return [...prev, fmsg];
            });
          } catch (err) {
            console.error('Error processing message_sent:', err);
          }
        });

        socket.on('online_users', (users: string[]) => {
          if (!mounted) return;
          setOnlineUsers(users || []);
        });
      } catch (err) {
        // socket.io-client not installed — ignore silently, but keep REST fallback
        console.warn('socket.io-client not available, real-time disabled');
      }
    };

    initSocket();

    return () => {
      mounted = false;
      try {
        if (socket?.connected) {
          socket.disconnect();
        }
      } catch (e) {}
    };
  }, [user?.id]);

  // Envoyer un message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ userId, content, image }: { userId: string; content?: string; image?: string | null }) => {
      // Validate that we have either text or image
      if (!content?.trim() && !image) {
        throw new Error('Le message doit contenir du texte ou une image');
      }
      return await messageService.sendMessage(userId, { text: content?.trim() || '', image });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'envoyer le message',
        variant: 'destructive',
      });
    },
  });

  const sendMessage = useCallback((conversationId: string, content: string, senderId: string, image?: string | null) => {
    if (!selectedUserId) return;
    sendMessageMutation.mutate({ userId: selectedUserId, content, image });
  }, [selectedUserId, sendMessageMutation]);

  const startNewConversation = useCallback((user: FrontendUser, currentUserId: string) => {
    const existingConversation = conversations.find(conv => conv.participant.id === user.id);
    
    if (existingConversation) {
      setSelectedConversationState(existingConversation);
      setSelectedUserId(user.id);
      return existingConversation;
    }

    const newConversation: Conversation = {
      id: user.id, // Utiliser l'ID de l'utilisateur comme ID de conversation
      participant: user,
      lastMessage: '',
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
    };

    setSelectedConversationState(newConversation);
    setSelectedUserId(user.id);
    // add to conversation list if missing
    setConversations(prev => {
      if (prev.some(p => p.id === newConversation.id)) return prev;
      return [newConversation, ...prev];
    });
    return newConversation;
  }, [conversations]);

  const markAsUnread = useCallback((conversationId: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, unreadCount: Math.max(1, conv.unreadCount) }
          : conv
      )
    );
  }, []);

  const markAsRead = useCallback((conversationId: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
  }, []);

  const archiveConversation = useCallback((conversationId: string) => {
    // TODO: Implémenter l'archivage de conversation avec l'API
    // Pour l'instant, on filtre simplement la conversation de la liste
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
  }, []);

  const deleteConversation = useCallback((conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    setMessages(prev => prev.filter(msg => (msg as any).conversationId !== conversationId));

    if (selectedConversation?.id === conversationId) {
      const next = conversations[0] || null;
      setSelectedConversationState(next);
      setSelectedUserId(next ? next.id : null);
    }
  }, [selectedConversation, conversations]);

  // wrapper to set selected conversation in a way that keeps selectedUserId in sync
  const setSelectedConversation = useCallback((conv: Conversation | null) => {
    setSelectedConversationState(conv);
    setSelectedUserId(conv ? conv.id : null);
  }, []);

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      return await messageService.deleteMessage(messageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: 'Message supprimé',
        description: 'Le message a été supprimé avec succès.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer le message',
        variant: 'destructive',
      });
    },
  });

  const deleteMessage = useCallback((messageId: string) => {
    deleteMessageMutation.mutate(messageId);
  }, [deleteMessageMutation]);

  // Update message (edit)
  const updateMessageMutation = useMutation({
    mutationFn: async ({ messageId, content, image }: { messageId: string; content?: string; image?: string | null }) => {
      return await messageService.updateMessage(messageId, { text: content || '', image });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({ title: 'Message mis à jour', description: 'Le message a été modifié.' });
    },
    onError: (error: any) => {
      toast({ title: 'Erreur', description: error.message || 'Impossible de mettre à jour le message', variant: 'destructive' });
    }
  });

  const updateMessage = useCallback((messageId: string, content?: string, image?: string | null) => {
    updateMessageMutation.mutate({ messageId, content, image });
  }, [updateMessageMutation]);

  const getConversationMessages = useCallback((conversationId: string) => {
    return messages;
  }, [messages]);

  return {
    conversations,
    messages,
    selectedConversation,
    setSelectedConversation,
    sendMessage,
    startNewConversation,
    markAsUnread,
    markAsRead,
    archiveConversation,
    deleteConversation,
    deleteMessage,
    getConversationMessages,
    isLoadingMessages,
    isSending: sendMessageMutation.isPending,
    isUpdating: updateMessageMutation.isPending,
    updateMessage,
    onlineUsers,
  };
};