import apiClient from '../client';
import { API_ENDPOINTS } from '../config';

export interface Message {
  _id: string;
  sender: {
    _id: string;
    fullname: string;
    username: string;
    profileImage?: string;
  };
  receiver: {
    _id: string;
    fullname: string;
    username: string;
    profileImage?: string;
  };
  text: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageData {
  text: string;
  image?: string; // base64 string
}

export interface MessageResponse {
  success: boolean;
  data: Message;
}

export const messageService = {
  /**
   * Obtenir tous les messages d'une conversation avec un utilisateur
   */
  async getConversation(userId: string): Promise<Message[]> {
    return apiClient.get<Message[]>(API_ENDPOINTS.MESSAGES.GET_CONVERSATION(userId));
  },

  /**
   * Récupérer la liste des conversations pour l'utilisateur connecté
   */
  async getConversations(): Promise<{ success: boolean; count: number; conversations: any[] }> {
    return apiClient.get<{ success: boolean; count: number; conversations: any[] }>(API_ENDPOINTS.MESSAGES.CONVERSATIONS);
  },

  /**
   * Envoyer un message à un utilisateur
   */
  async sendMessage(userId: string, data: SendMessageData): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>(
      API_ENDPOINTS.MESSAGES.SEND(userId),
      data
    );
  },

  /**
   * Mettre à jour un message
   */
  async updateMessage(messageId: string, data: SendMessageData): Promise<MessageResponse> {
    return apiClient.put<MessageResponse>(
      API_ENDPOINTS.MESSAGES.UPDATE(messageId),
      data
    );
  },

  /**
   * Supprimer un message
   */
  async deleteMessage(messageId: string): Promise<{
    success: boolean;
    message: string;
    deletedMessageId: string;
  }> {
    return apiClient.delete<{
      success: boolean;
      message: string;
      deletedMessageId: string;
    }>(API_ENDPOINTS.MESSAGES.DELETE(messageId));
  },
};

