import apiClient from '../client';
import { API_ENDPOINTS } from '../config';

export interface Post {
  _id: string;
  content: string;
  author: {
    _id: string;
    fullname: string;
    username: string;
    profileImage?: string;
  };
  media?: Array<{
    _id: string;
    url: string;
    type: 'image' | 'video';
  }>;
  visibility: 'public' | 'private' | 'connections';
  likes: string[];
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  content: string;
  visibility?: 'public' | 'private' | 'connections';
  media?: File[];
}

export interface UpdatePostData {
  content?: string;
  visibility?: 'public' | 'private' | 'connections';
  mediaToDelete?: string[];
  media?: File[];
}

export interface PostsResponse {
  success: boolean;
  count?: number;
  data: Post[];
}

export interface PostResponse {
  success: boolean;
  data: Post;
}

export interface LikeResponse {
  success: boolean;
  message: string;
  likesCount: number;
  isLiked: boolean;
}

export const postService = {
  /**
   * Créer un nouveau post
   */
  async createPost(data: CreatePostData): Promise<PostResponse> {
    const formData = new FormData();
    formData.append('content', data.content);
    
    if (data.visibility) {
      formData.append('visibility', data.visibility);
    }
    
    if (data.media && data.media.length > 0) {
      data.media.forEach((file) => {
        formData.append('media', file);
      });
    }

    return apiClient.postFormData<PostResponse>(API_ENDPOINTS.POSTS.CREATE, formData);
  },

  /**
   * Obtenir tous les posts de l'utilisateur connecté
   */
  async getMyPosts(): Promise<PostsResponse> {
    return apiClient.get<PostsResponse>(API_ENDPOINTS.POSTS.GET_ALL);
  },

  /**
   * Obtenir tous les posts publics avec pagination
   */
  async getPublicPosts(page: number = 1, limit: number = 10): Promise<PostsResponse & { pagination?: any }> {
    return apiClient.get<PostsResponse & { pagination?: any }>(
      `${API_ENDPOINTS.POSTS.GET_PUBLIC}?page=${page}&limit=${limit}`
    );
  },

  /**
   * Obtenir un post par son ID
   */
  async getPostById(id: string): Promise<PostResponse> {
    return apiClient.get<PostResponse>(API_ENDPOINTS.POSTS.GET_BY_ID(id));
  },

  /**
   * Aimer ou désaimer un post
   */
  async likePost(id: string): Promise<LikeResponse> {
    return apiClient.post<LikeResponse>(API_ENDPOINTS.POSTS.LIKE(id));
  },

  /**
   * Supprimer un post
   */
  async deletePost(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.POSTS.DELETE(id)
    );
  },

  /**
   * Mettre à jour un post
   */
  async updatePost(id: string, data: UpdatePostData): Promise<PostResponse> {
    const formData = new FormData();
    
    if (data.content) {
      formData.append('content', data.content);
    }
    
    if (data.visibility) {
      formData.append('visibility', data.visibility);
    }
    
    if (data.mediaToDelete && data.mediaToDelete.length > 0) {
      data.mediaToDelete.forEach((mediaId) => {
        formData.append('mediaToDelete', mediaId);
      });
    }
    
    if (data.media && data.media.length > 0) {
      data.media.forEach((file) => {
        formData.append('media', file);
      });
    }

    return apiClient.putFormData<PostResponse>(API_ENDPOINTS.POSTS.UPDATE(id), formData);
  },
};

