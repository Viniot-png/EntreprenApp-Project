/**
 * Configuration de l'API
 * L'URL de base du backend peut être définie via la variable d'environnement VITE_API_BASE_URL
 * Par défaut, elle pointe vers http://localhost:3000 (port standard du backend)
 */
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 30000, // 30 secondes
  withCredentials: true, // Important pour les cookies d'authentification
} as const;

export const API_ENDPOINTS = {
  // Authentification
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    VERIFY_EMAIL: '/api/auth/verify',
    RESEND_CODE: '/api/auth/resend-code',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: (token: string) => `/api/auth/reset-password/${token}`,
    PROFILE: '/api/auth/profile',
    UPDATE_PROFILE: '/api/auth/profile/edit',
    REFRESH_TOKEN: '/api/auth/refresh',
  },
  // Posts
  POSTS: {
    CREATE: '/api/post/create-post',
    GET_ALL: '/api/post',
    GET_PUBLIC: '/api/post/public',
    GET_BY_ID: (id: string) => `/api/post/${id}`,
    LIKE: (id: string) => `/api/post/like/${id}`,
    DELETE: (id: string) => `/api/post/delete/${id}`,
    UPDATE: (id: string) => `/api/post/edit/${id}`,
  },
  // Messages
  MESSAGES: {
    GET_CONVERSATION: (userId: string) => `/api/message/${userId}`,
    SEND: (userId: string) => `/api/message/send/${userId}`,
    UPDATE: (messageId: string) => `/api/message/update/${messageId}`,
    DELETE: (messageId: string) => `/api/message/delete/${messageId}`,
    CONVERSATIONS: '/api/message/conversations',
  },
  // Amis
  FRIENDS: {
    GET_ALL: '/api/friend',
    ALL_USERS: '/api/friend/all',
    GET_PENDING: '/api/friend/pending',
    SEND_REQUEST: '/api/friend/invitation',
    RESPOND_REQUEST: (requestId: string) => `/api/friend/invitation/${requestId}`,
  },
  // Événements
  EVENTS: {
    BASE: '/api/event',
    GET_ALL: '/api/event',
    GET_BY_ID: (id: string) => `/api/event/${id}`,
    CREATE: '/api/event/create-event',
    UPDATE: (id: string) => `/api/event/${id}/edit`,
    DELETE: (id: string) => `/api/event/${id}/delete`,
    REGISTER: (id: string) => `/api/event/${id}/register`,
  },
  // Projets
  PROJECTS: {
    BASE: '/api/project',
    GET_ALL: '/api/project',
    GET_BY_ID: (id: string) => `/api/project/${id}`,
    CREATE: '/api/project/create-project',
    UPDATE: (id: string) => `/api/project/${id}/edit`,
    DELETE: (id: string) => `/api/project/${id}/delete`,
    INVEST: (id: string) => `/api/project/${id}/invest`,
  },
  // Défis
  CHALLENGES: {
    BASE: '/api/challenge',
    GET_ALL: '/api/challenge',
    GET_BY_ID: (id: string) => `/api/challenge/${id}`,
    CREATE: '/api/challenge/create-challenge',
    UPDATE: (id: string) => `/api/challenge/${id}/edit`,
    DELETE: (id: string) => `/api/challenge/${id}/delete`,
    APPLY: (id: string) => `/api/challenge/${id}/apply`,
    SELECT_APPLICANT: (challengeId: string, applicantId: string) =>
      `/api/challenge/${challengeId}/select/${applicantId}`,
  },
  // Commentaires
  COMMENTS: {
    BASE: '/api/comment',
    GET_BY_POST: (postId: string) => `/api/comment/post/${postId}`,
    ADD_TO_POST: (postId: string) => `/api/comment/post/${postId}`,
    GET_BY_ID: (id: string) => `/api/comment/${id}`,
    UPDATE: (id: string) => `/api/comment/edit/${id}`,
    DELETE: (id: string) => `/api/comment/delete/${id}`,
  },
} as const;

