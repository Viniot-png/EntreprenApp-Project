import apiClient from '../client';
import { API_ENDPOINTS } from '../config';

export interface Friend {
  _id: string;
  fullname: string;
  email: string;
  profileImage?: string;
  username?: string;
}

export interface FriendRequest {
  _id: string;
  sender: Friend;
  receiver: Friend;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface FriendsResponse {
  success: boolean;
  count: number;
  friends: Friend[];
}

export interface FriendRequestsResponse {
  success: boolean;
  count: number;
  pendingRequests: FriendRequest[];
}

export interface SendFriendRequestData {
  receiverId: string;
}

export interface RespondToRequestData {
  action: 'accepted' | 'rejected';
}

export interface User {
  id: string;
  fullname: string;
  username: string;
  email: string;
  profileImage?: string;
  role: string;
  location?: string;
  company?: string;
  bio?: string;
  status: 'friend' | 'pending' | 'accepted' | 'rejected' | 'none';
  requestId?: string;
  requestDirection?: 'sent' | 'received';
}

export interface AllUsersResponse {
  success: boolean;
  count: number;
  users: User[];
}

export const friendService = {
  /**
   * Obtenir la liste des amis
   */
  async getFriends(): Promise<FriendsResponse> {
    return apiClient.get<FriendsResponse>(API_ENDPOINTS.FRIENDS.GET_ALL);
  },

  /**
   * Obtenir tous les utilisateurs avec statut d'amitié
   */
  async getAllUsers(): Promise<AllUsersResponse> {
    return apiClient.get<AllUsersResponse>(API_ENDPOINTS.FRIENDS.ALL_USERS);
  },

  /**
   * Obtenir les demandes d'amis en attente
   */
  async getPendingRequests(): Promise<FriendRequestsResponse> {
    return apiClient.get<FriendRequestsResponse>(API_ENDPOINTS.FRIENDS.GET_PENDING);
  },

  /**
   * Envoyer une demande d'ami
   */
  async sendFriendRequest(data: SendFriendRequestData): Promise<{
    success: boolean;
    message: string;
    data: FriendRequest;
  }> {
    return apiClient.post<{
      success: boolean;
      message: string;
      data: FriendRequest;
    }>(API_ENDPOINTS.FRIENDS.SEND_REQUEST, data);
  },

  /**
   * Répondre à une demande d'ami
   */
  async respondToFriendRequest(
    requestId: string,
    data: RespondToRequestData
  ): Promise<{
    success: boolean;
    message: string;
    data: FriendRequest;
  }> {
    return apiClient.post<{
      success: boolean;
      message: string;
      data: FriendRequest;
    }>(API_ENDPOINTS.FRIENDS.RESPOND_REQUEST(requestId), data);
  },

  /**
   * Supprimer une connexion ami
   */
  async removeFriend(friendId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return apiClient.delete<{
      success: boolean;
      message: string;
    }>(`${API_ENDPOINTS.FRIENDS.GET_ALL}/${friendId}`);
  },
};

