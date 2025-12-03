import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from './config';

/**
 * Client HTTP configuré avec intercepteurs pour gérer l'authentification
 * et les erreurs de manière centralisée
 */
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      withCredentials: API_CONFIG.withCredentials,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Intercepteur de requête : les cookies sont automatiquement envoyés grâce à withCredentials: true
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Les cookies HTTP-only sont automatiquement envoyés avec chaque requête
        // grâce à withCredentials: true dans la configuration axios
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Intercepteur de réponse : gère les erreurs et le refresh token
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        const originalURL = originalRequest?.url || '';

        // Ne pas retry si:
        // 1. Déjà tenté (flag _retry)
        // 2. C'est un appel au refresh endpoint lui-même (évite boucle infinie)
        // 3. C'est autre chose qu'un 401
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalURL.includes('/auth/refresh')
        ) {
          originalRequest._retry = true;

          try {
            console.log('[AUTH] Attempting to refresh token...');
            
            // Tenter de rafraîchir le token
            await this.client.post('/api/auth/refresh');
            
            console.log('[AUTH] Token refreshed successfully');
            
            // Réessayer la requête originale
            return this.client(originalRequest);
          } catch (refreshError) {
            // Si le refresh échoue, déconnecter l'utilisateur
            console.error('[AUTH] Refresh token failed:', refreshError);
            this.handleLogout();
            return Promise.reject(refreshError);
          }
        }

        // Si c'est un 401 sur le refresh endpoint lui-même
        if (
          error.response?.status === 401 &&
          originalURL.includes('/auth/refresh')
        ) {
          console.warn('[AUTH] Refresh token invalid or expired, logging out');
          this.handleLogout();
        }

        // Gérer les autres erreurs
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleLogout() {
    // Nettoyer le localStorage (les cookies seront supprimés par le backend lors du logout)
    localStorage.removeItem('user');
    // Rediriger vers la page de connexion
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  private handleError(error: AxiosError): Error {
    if (error.response) {
      // Le serveur a répondu avec un code d'erreur
      const message = (error.response.data as any)?.message || error.message;
      return new Error(message);
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      return new Error('Aucune réponse du serveur. Vérifiez votre connexion.');
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      return new Error(error.message || 'Une erreur est survenue');
    }
  }

  // Méthodes HTTP
  get<T = any>(url: string, config?: any): Promise<T> {
    return this.client.get<T>(url, config).then((response) => response.data);
  }

  post<T = any>(url: string, data?: any, config?: any): Promise<T> {
    return this.client.post<T>(url, data, config).then((response) => response.data);
  }

  put<T = any>(url: string, data?: any, config?: any): Promise<T> {
    return this.client.put<T>(url, data, config).then((response) => response.data);
  }

  patch<T = any>(url: string, data?: any, config?: any): Promise<T> {
    return this.client.patch<T>(url, data, config).then((response) => response.data);
  }

  delete<T = any>(url: string, config?: any): Promise<T> {
    return this.client.delete<T>(url, config).then((response) => response.data);
  }

  // Pour les uploads de fichiers (FormData)
  postFormData<T = any>(url: string, formData: FormData, config?: any): Promise<T> {
    return this.client.post<T>(url, formData, {
      ...config,
      headers: {
        // Important: Ne pas définir Content-Type manuellement
        // Axios doit le faire automatiquement pour ajouter le boundary
        ...config?.headers,
      },
    }).then((response) => response.data);
  }

  putFormData<T = any>(url: string, formData: FormData, config?: any): Promise<T> {
    return this.client.put<T>(url, formData, {
      ...config,
      headers: {
        // Important: Ne pas définir Content-Type manuellement
        // Axios doit le faire automatiquement pour ajouter le boundary
        ...config?.headers,
      },
    }).then((response) => response.data);
  }

  // Instance axios brute pour les cas spéciaux
  getInstance(): AxiosInstance {
    return this.client;
  }
}

// Export d'une instance singleton
export const apiClient = new ApiClient();
export default apiClient;

