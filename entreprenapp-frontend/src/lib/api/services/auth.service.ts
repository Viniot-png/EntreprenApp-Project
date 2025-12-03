import apiClient from '../client';
import { API_ENDPOINTS } from '../config';
import {
  backendToFrontendUser,
  frontendToBackendRegisterData,
  frontendToBackendUpdateProfileData,
  type FrontendRegisterData,
  type FrontendUpdateProfileData,
  type FrontendUser,
} from '../utils/userAdapter';

// Interface pour les données d'inscription du backend
export interface RegisterData {
  username: string;
  fullname: string;
  email: string;
  password: string;
  role: 'entrepreneur' | 'investor' | 'startup' | 'organisation' | 'university';
  location?: string;
  gender?: string;
  dob?: string;
  sector?: string;
  professionalEmail?: string;
  foundedYear?: number;
  universityName?: string;
  officialUniversityEmail?: string;
  verificationDocument?: File;
}

// Réexporter le type FrontendRegisterData depuis userAdapter
export type { FrontendRegisterData } from '../utils/userAdapter';

export interface LoginData {
  email: string;
  password: string;
}

// Interface pour les données utilisateur du backend
export interface User {
  _id: string;
  username: string;
  fullname: string;
  email: string;
  role: string;
  profileImage?: string | { url?: string; publicId?: string };
  coverImage?: string | { url?: string; publicId?: string };
  bio?: string;
  location?: string;
  gender?: string;
  dob?: string;
  isEmailVerified?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Réexporter le type FrontendUser pour faciliter l'utilisation
export type { FrontendUser } from '../utils/userAdapter';

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  data?: any;
}

export const authService = {
  /**
   * Inscription d'un nouvel utilisateur
   * Accepte les données au format frontend (firstName, lastName, name) ou backend (fullname, username)
   */
  async register(data: RegisterData | FrontendRegisterData): Promise<AuthResponse> {
    // Convertir les données frontend vers le format backend si nécessaire
    const backendData = frontendToBackendRegisterData(data as any);
    
    const formData = new FormData();
    
    // Ajouter tous les champs au FormData
    Object.entries(backendData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'verificationDocument' && value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'object' && !(value instanceof File)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    return apiClient.postFormData<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, formData);
  },

  /**
   * Connexion d'un utilisateur
   * Les tokens sont stockés dans des cookies HTTP-only par le backend
   */
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, data);

    try {
      // Backend may return user in `response.user` or in `response.data`.
      const backendUser = (response as any).user || (response as any).data;
      if (backendUser) {
        const frontendUser = backendToFrontendUser(backendUser as any);
        localStorage.setItem('user', JSON.stringify(frontendUser));
        (response as any).user = frontendUser as any;
      }

      // If backend returned tokens (helpful in dev if cookies are blocked), persist access token and set Authorization header
      const tokens: any = (response as any).tokens;
      if (tokens?.accessToken) {
        localStorage.setItem('accessToken', tokens.accessToken);
        apiClient.getInstance().defaults.headers['Authorization'] = `Bearer ${tokens.accessToken}`;
      }
    } catch (e) {
      console.warn('login: unable to process response tokens/user', e);
    }

    return response;
  },

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      // Les cookies seront supprimés par le backend
      localStorage.removeItem('user');
    }
  },

  /**
   * Vérification de l'email avec un code
   */
  async verifyEmail(verificationCode: string): Promise<AuthResponse> {
    const resp = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
      verificationCode,
    });

    // If backend returned tokens (useful when cookies are blocked by SameSite/CORS during dev),
    // store them and set Authorization header for subsequent requests.
    try {
      const tokens: any = (resp as any).tokens;
      if (tokens?.accessToken) {
        localStorage.setItem('accessToken', tokens.accessToken);
        apiClient.getInstance().defaults.headers['Authorization'] = `Bearer ${tokens.accessToken}`;
      }

      // If the backend returned a user in data, normalize and store it locally
      if (resp.data) {
        const frontendUser = backendToFrontendUser(resp.data as any);
        localStorage.setItem('user', JSON.stringify(frontendUser));
        // also attach user to response.user for callers
        (resp as any).user = frontendUser as any;
      }
    } catch (e) {
      // ignore any processing errors, keep original response
      console.warn('verifyEmail: unable to persist tokens/user', e);
    }

    return resp;
  },

  /**
   * Renvoyer le code de vérification
   */
  async resendVerificationCode(email: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.RESEND_CODE, { email });
  },

  /**
   * Mot de passe oublié
   */
  async forgotPassword(email: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  /**
   * Réinitialisation du mot de passe
   */
  async resetPassword(resetToken: string, password: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD(resetToken),
      { password }
    );
  },

  /**
   * Obtenir le profil de l'utilisateur connecté
   * Retourne l'utilisateur au format frontend
   */
  async getProfile(): Promise<{ success: boolean; data: FrontendUser }> {
    const response = await apiClient.get<{ success: boolean; data: User }>(API_ENDPOINTS.AUTH.PROFILE);
    return {
      success: response.success,
      data: backendToFrontendUser(response.data),
    };
  },

  /**
   * Obtenir le profil d'un utilisateur par son ID
   * Retourne l'utilisateur au format frontend
   */
  async getUserProfile(userId: string): Promise<{ success: boolean; data: FrontendUser }> {
    const response = await apiClient.get<{ success: boolean; data: User }>(`${API_ENDPOINTS.AUTH.PROFILE}/${userId}`);
    return {
      success: response.success,
      data: backendToFrontendUser(response.data),
    };
  },

  /**
   * Mettre à jour le profil
   * Accepte les données au format frontend (name) ou backend (fullname)
   * Accepte aussi directement une FormData
   */
  async updateProfile(data: FrontendUpdateProfileData | FormData | {
    fullname?: string;
    bio?: string;
    gender?: string;
    dob?: string;
    location?: string;
    profileImage?: File;
    coverImage?: File;
    name?: string; // Support pour le format frontend
  }): Promise<AuthResponse> {
    // Si c'est déjà une FormData, l'utiliser directement
    if (data instanceof FormData) {
      const response = await apiClient.putFormData<AuthResponse>(API_ENDPOINTS.AUTH.UPDATE_PROFILE, data);
      
      // Convertir l'utilisateur dans la réponse si présent
      if (response.user) {
        response.user = backendToFrontendUser(response.user) as any;
      }
      
      return response;
    }
    
    // Convertir les données frontend vers le format backend si nécessaire
    const backendData = frontendToBackendUpdateProfileData(data as any);
    
    const formData = new FormData();
    
    Object.entries(backendData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if ((key === 'profileImage' || key === 'coverImage') && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await apiClient.putFormData<AuthResponse>(API_ENDPOINTS.AUTH.UPDATE_PROFILE, formData);
    
    // Convertir l'utilisateur dans la réponse si présent
    if (response.user) {
      response.user = backendToFrontendUser(response.user) as any;
    }
    
    return response;
  },

  /**
   * Rafraîchir le token
   */
  async refreshToken(): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH_TOKEN);
  },
};

