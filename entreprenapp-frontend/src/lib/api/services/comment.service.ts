import apiClient from '../client';
import { API_ENDPOINTS } from '../config';

export interface Comment {
  _id: string;
  content: string;
  post: string;
  author: {
    _id: string;
    fullname: string;
    username: string;
    profileImage?: string;
  };
  parentComment?: string; // Pour les réponses
  replies?: Comment[]; // Réponses à ce commentaire
  likesCount?: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentData {
  content: string;
}

export interface UpdateCommentData {
  content: string;
}

export interface CommentResponse {
  success: boolean;
  message?: string;
  data: Comment;
}

export interface CommentsResponse {
  success: boolean;
  count?: number;
  data: Comment[];
}

export const commentService = {
  /**
   * Obtenir tous les commentaires d'un post
   */
  async getCommentsByPost(postId: string): Promise<CommentsResponse> {
    return apiClient.get<CommentsResponse>(
      `${API_ENDPOINTS.COMMENTS.BASE}/post/${postId}`
    );
  },

  /**
   * Ajouter un commentaire à un post
   */
  async addComment(postId: string, data: CreateCommentData): Promise<CommentResponse> {
    return apiClient.post<CommentResponse>(
      `${API_ENDPOINTS.COMMENTS.BASE}/post/${postId}`,
      data
    );
  },

  /**
   * Obtenir un commentaire par son ID
   */
  async getComment(id: string): Promise<CommentResponse> {
    return apiClient.get<CommentResponse>(`${API_ENDPOINTS.COMMENTS.BASE}/${id}`);
  },

  /**
   * Mettre à jour un commentaire
   */
  async updateComment(id: string, data: UpdateCommentData): Promise<CommentResponse> {
    return apiClient.put<CommentResponse>(
      `${API_ENDPOINTS.COMMENTS.BASE}/edit/${id}`,
      data
    );
  },

  /**
   * Supprimer un commentaire
   */
  async deleteComment(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(
      `${API_ENDPOINTS.COMMENTS.BASE}/delete/${id}`
    );
  },

  /**
   * Ajouter une réponse à un commentaire
   */
  async addReply(commentId: string, data: CreateCommentData): Promise<CommentResponse> {
    return apiClient.post<CommentResponse>(
      `${API_ENDPOINTS.COMMENTS.BASE}/${commentId}/reply`,
      data
    );
  },

  /**
   * Obtenir les réponses d'un commentaire
   */
  async getCommentReplies(commentId: string): Promise<CommentsResponse> {
    return apiClient.get<CommentsResponse>(
      `${API_ENDPOINTS.COMMENTS.BASE}/${commentId}/replies`
    );
  },

  /**
   * Liker/disliker un commentaire
   */
  async likeComment(commentId: string): Promise<{ 
    success: boolean; 
    message: string; 
    likesCount: number; 
    isLiked: boolean 
  }> {
    return apiClient.post<{ 
      success: boolean; 
      message: string; 
      likesCount: number; 
      isLiked: boolean 
    }>(
      `${API_ENDPOINTS.COMMENTS.BASE}/${commentId}/like`
    );
  },
};

