import apiClient from '../client';

// Notifications service: connects to backend API endpoints

export interface NotificationItem {
  id?: string;
  _id?: string;
  type: string;
  title: string;
  content: string;
  actor?: any;
  createdAt: string;
  read?: boolean;
  readAt?: string;
}

export const notificationsService = {
  /**
   * Récupère toutes les notifications de l'utilisateur
   */
  async getNotifications(): Promise<{ success: boolean; data: NotificationItem[] }> {
    try {
      const resp = await apiClient.get<{ success: boolean; data: NotificationItem[] }>('/api/notification');
      return resp;
    } catch (err) {
      console.error('Erreur récupération notifications:', err);
      // Return empty array if endpoint doesn't exist
      return { success: true, data: [] };
    }
  },

  /**
   * Récupère le nombre de notifications non lues
   */
  async getUnreadCount(): Promise<{ success: boolean; unreadCount: number }> {
    try {
      const resp = await apiClient.get<{ success: boolean; unreadCount: number }>('/api/notification/unread/count');
      return resp;
    } catch (err) {
      console.error('Erreur comptage notifications:', err);
      return { success: false, unreadCount: 0 };
    }
  },

  /**
   * Marque une notification comme lue
   */
  async markAsRead(notificationId: string): Promise<{ success: boolean; data: NotificationItem }> {
    try {
      const resp = await apiClient.put<{ success: boolean; data: NotificationItem }>(`/api/notification/${notificationId}/read`, {});
      return resp;
    } catch (err) {
      console.error('Erreur marquage notification:', err);
      throw err;
    }
  },

  /**
   * Marque toutes les notifications comme lues
   */
  async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    try {
      const resp = await apiClient.put<{ success: boolean; message: string }>('/api/notification/read/all', {});
      return resp;
    } catch (err) {
      console.error('Erreur marquage notifications:', err);
      throw err;
    }
  },

  /**
   * Supprime une notification
   */
  async deleteNotification(notificationId: string): Promise<{ success: boolean; message: string }> {
    try {
      const resp = await apiClient.delete<{ success: boolean; message: string }>(`/api/notification/${notificationId}`);
      return resp;
    } catch (err) {
      console.error('Erreur suppression notification:', err);
      throw err;
    }
  },

  /**
   * Supprime toutes les notifications
   */
  async deleteAllNotifications(): Promise<{ success: boolean; message: string }> {
    try {
      const resp = await apiClient.delete<{ success: boolean; message: string }>('/api/notification/all');
      return resp;
    } catch (err) {
      console.error('Erreur suppression notifications:', err);
      throw err;
    }
  }
};
