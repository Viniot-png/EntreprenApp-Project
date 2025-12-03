import apiClient from '../client';
import { API_ENDPOINTS } from '../config';

export interface Bookmark {
  _id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export interface BookmarkResponse {
  success: boolean;
  message?: string;
  data?: Bookmark;
}

export interface BookmarksResponse {
  success: boolean;
  data: Bookmark[];
  count?: number;
}

export const bookmarkService = {
  /**
   * Ajouter ou retirer un post des favoris
   */
  async toggleBookmark(postId: string): Promise<BookmarkResponse> {
    return apiClient.post<BookmarkResponse>(
      `/api/post/bookmark/${postId}`,
      {}
    );
  },

  /**
   * Récupérer tous les favoris de l'utilisateur
   */
  async getBookmarks(): Promise<BookmarksResponse> {
    return apiClient.get<BookmarksResponse>('/api/post/bookmarks');
  },

  /**
   * Vérifier si un post est en favori
   */
  async isBookmarked(postId: string): Promise<{ success: boolean; isBookmarked: boolean }> {
    return apiClient.get<{ success: boolean; isBookmarked: boolean }>(
      `/api/post/is-bookmarked/${postId}`
    );
  },

  /**
   * Supprimer un favori
   */
  async removeBookmark(postId: string): Promise<BookmarkResponse> {
    return apiClient.delete<BookmarkResponse>(`/api/post/bookmark/${postId}`);
  },
};
