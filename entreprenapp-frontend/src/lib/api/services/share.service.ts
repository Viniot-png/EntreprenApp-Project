import apiClient from '../client';
import { API_ENDPOINTS } from '../config';

export interface ShareResponse {
  success: boolean;
  message?: string;
  sharesCount?: number;
}

export const shareService = {
  /**
   * Enregistrer un partage de post
   */
  async recordShare(postId: string): Promise<ShareResponse> {
    return apiClient.post<ShareResponse>(
      `/api/post/share/${postId}`,
      {}
    );
  },

  /**
   * Obtenir le nombre de partages d'un post
   */
  async getSharesCount(postId: string): Promise<{ success: boolean; sharesCount: number }> {
    return apiClient.get<{ success: boolean; sharesCount: number }>(
      `/api/post/shares/${postId}`
    );
  },
};
