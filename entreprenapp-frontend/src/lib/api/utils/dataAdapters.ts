/**
 * Adaptateurs pour convertir les données entre le format frontend et backend
 * pour les posts, messages, commentaires, etc.
 */

import type { Post as BackendPost } from '../services/post.service';
import type { Message as BackendMessage } from '../services/message.service';
import type { Comment as BackendComment } from '../services/comment.service';
import { backendToFrontendUser } from './userAdapter';

// Types frontend (depuis mockData.ts)
export interface FrontendPost {
  id: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
    company?: string;
    [key: string]: any;
  };
  content: string;
  media?: Array<{
    type: 'image' | 'video' | 'document';
    url: string;
    title?: string;
  }>;
  externalLink?: {
    url: string;
    title: string;
    description: string;
    image?: string;
  };
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FrontendMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  image?: string | null;
  createdAt: string;
}

export interface FrontendComment {
  id: string;
  postId: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    [key: string]: any;
  };
  content: string;
  replies?: FrontendComment[];
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Convertit un post du backend vers le format frontend
 */
export function backendToFrontendPost(backendPost: BackendPost | any): FrontendPost {
  // Adapter les médias
  const media = backendPost.media?.map((m: any) => ({
    type: m.type || 'image',
    url: typeof m === 'string' ? m : m.url || m,
    title: m.title,
  })) || [];

  // Adapter l'auteur
  const author = backendPost.author ? {
    id: backendPost.author._id || backendPost.author.id,
    name: backendPost.author.fullname || backendPost.author.name || '',
    avatar: typeof backendPost.author.profileImage === 'string' 
      ? backendPost.author.profileImage 
      : backendPost.author.profileImage?.url || backendPost.author.avatar,
    role: backendPost.author.role || '',
    company: backendPost.author.company || '',
    ...backendPost.author,
  } : {
    id: backendPost.authorId || '',
    name: '',
  };

  return {
    id: backendPost._id || backendPost.id,
    authorId: backendPost.author?._id || backendPost.authorId || '',
    author,
    content: backendPost.content || '',
    media,
    likesCount: backendPost.likesCount || backendPost.likes?.length || 0,
    commentsCount: backendPost.commentsCount || backendPost.comments?.length || 0,
    sharesCount: 0, // Pas dans le backend pour l'instant
    isLiked: backendPost.isLiked || false,
    createdAt: backendPost.createdAt || new Date().toISOString(),
    updatedAt: backendPost.updatedAt || backendPost.createdAt || new Date().toISOString(),
  };
}

/**
 * Convertit un message du backend vers le format frontend
 */
export function backendToFrontendMessage(backendMessage: BackendMessage | any): FrontendMessage {
  return {
    id: backendMessage._id || backendMessage.id,
    conversationId: backendMessage.conversationId || '',
    senderId: backendMessage.sender?._id || backendMessage.senderId || '',
    content: backendMessage.text || backendMessage.content || '',
    image: backendMessage.image || null,
    createdAt: backendMessage.createdAt || new Date().toISOString(),
  };
}

/**
 * Convertit un commentaire du backend vers le format frontend
 */
export function backendToFrontendComment(backendComment: BackendComment | any): FrontendComment {
  const author = backendComment.author ? {
    id: backendComment.author._id || backendComment.author.id,
    name: backendComment.author.fullname || backendComment.author.name || '',
    avatar: typeof backendComment.author.profileImage === 'string'
      ? backendComment.author.profileImage
      : backendComment.author.profileImage?.url || backendComment.author.avatar,
    ...backendComment.author,
  } : {
    id: backendComment.authorId || '',
    name: '',
  };

  return {
    id: backendComment._id || backendComment.id,
    postId: backendComment.post || backendComment.postId || '',
    authorId: backendComment.author?._id || backendComment.authorId || '',
    author,
    content: backendComment.content || '',
    replies: backendComment.replies?.map((r: any) => backendToFrontendComment(r)) || [],
    likesCount: backendComment.likesCount || 0,
    isLiked: backendComment.isLiked || false,
    createdAt: backendComment.createdAt || new Date().toISOString(),
    updatedAt: backendComment.updatedAt || backendComment.createdAt || new Date().toISOString(),
  };
}

/**
 * Convertit les données de création de post du frontend vers le backend
 */
export function frontendToBackendPostData(data: {
  content: string;
  visibility?: 'public' | 'private' | 'connections';
  media?: File[];
}): {
  content: string;
  visibility?: 'public' | 'private' | 'connections';
  media?: File[];
} {
  return {
    content: data.content,
    visibility: data.visibility || 'public',
    media: data.media,
  };
}

