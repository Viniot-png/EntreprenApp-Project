import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsService, NotificationItem } from '@/lib/api/services/notifications.service';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const useNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Récupérer les notifications depuis le serveur
  const { data: fetchedNotifications, refetch: refetchNotifications } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const resp = await notificationsService.getNotifications();
      return resp.data || [];
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Synchroniser les notifications
  useEffect(() => {
    if (fetchedNotifications && fetchedNotifications.length > 0) {
      setNotifications(fetchedNotifications);
      const unread = fetchedNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    }
  }, [fetchedNotifications]);

  // Écouter les notifications en temps réel via Socket.IO
  useEffect(() => {
    if (!user) return;

    // Get socket from global scope (exposed by backend)
    const io = (window as any).io;
    if (!io) return;

    // Connect to the same server
    const socket = io(window.location.origin, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      socket.emit('join', { userId: user.id });
    });

    // Listen for new notifications
    socket.on('new_notification', (notification: NotificationItem) => {
      console.log('New notification received:', notification);
      
      // Add to beginning of list
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Show toast
      const getNotificationTitle = (type: string) => {
        const titles: { [key: string]: string } = {
          message: '💬 Nouveau message',
          post: '📝 Nouveau post',
          friend_request: '👋 Demande d\'ami',
          friend_accept: '✅ Ami ajouté',
          event: '🎉 Nouvel événement',
          like: '❤️ J\'aime',
          comment: '💬 Commentaire',
        };
        return titles[type] || 'Nouvelle notification';
      };

      toast({
        title: getNotificationTitle(notification.type),
        description: notification.content || notification.title,
        duration: 4000,
      });

      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      socket.off('new_notification');
      socket.off('disconnect');
      socket.disconnect();
    };
  }, [user, toast, queryClient]);

  // Marquer une notification comme lue
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationsService.markAsRead(notificationId);
      
      setNotifications(prev =>
        prev.map(n => 
          (n._id || n.id) === notificationId 
            ? { ...n, read: true } 
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Refetch to sync with server
      refetchNotifications();
    } catch (error) {
      console.error('Erreur marquage notification:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de marquer la notification comme lue',
        variant: 'destructive',
      });
    }
  }, [refetchNotifications, toast]);

  // Marquer toutes comme lues
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsService.markAllAsRead();
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
      
      toast({
        title: 'Succès',
        description: 'Toutes les notifications ont été marquées comme lues',
        duration: 2000,
      });
      
      refetchNotifications();
    } catch (error) {
      console.error('Erreur marquage notifications:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de marquer les notifications comme lues',
        variant: 'destructive',
      });
    }
  }, [refetchNotifications, toast]);

  // Supprimer une notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationsService.deleteNotification(notificationId);
      
      const wasUnread = notifications.find(n => (n._id || n.id) === notificationId)?.read === false;
      
      setNotifications(prev =>
        prev.filter(n => (n._id || n.id) !== notificationId)
      );
      
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast({
        title: 'Supprimé',
        description: 'Notification supprimée',
        duration: 2000,
      });
      
      refetchNotifications();
    } catch (error) {
      console.error('Erreur suppression notification:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la notification',
        variant: 'destructive',
      });
    }
  }, [notifications, refetchNotifications, toast]);

  // Supprimer toutes les notifications
  const deleteAllNotifications = useCallback(async () => {
    try {
      await notificationsService.deleteAllNotifications();
      
      setNotifications([]);
      setUnreadCount(0);
      
      toast({
        title: 'Supprimé',
        description: 'Toutes les notifications ont été supprimées',
        duration: 2000,
      });
      
      refetchNotifications();
    } catch (error) {
      console.error('Erreur suppression notifications:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer les notifications',
        variant: 'destructive',
      });
    }
  }, [refetchNotifications, toast]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refetch: refetchNotifications,
  };
};
