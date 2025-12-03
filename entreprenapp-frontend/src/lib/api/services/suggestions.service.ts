import apiClient from '../client';

export interface SuggestionUser {
  _id: string;
  fullname: string;
  username: string;
  profileImage?: string;
  role: string;
  email: string;
}

export interface SuggestionsResponse {
  success: boolean;
  data: SuggestionUser[];
}

export const suggestionsService = {
  /**
   * Obtenir les suggestions de connexion
   */
  async getConnectionSuggestions(): Promise<SuggestionsResponse> {
    return apiClient.get<SuggestionsResponse>('/api/suggestions');
  },

  /**
   * Envoyer une demande de connexion
   */
  async sendFriendRequest(targetUserId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>(
      '/api/suggestions/request',
      { targetUserId }
    );
  },
};
