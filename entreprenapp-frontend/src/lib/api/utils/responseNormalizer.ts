/**
 * Normalisation des réponses API
 * Pattern unifié: {success: boolean, data: T, message?: string, pagination?: {}}
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Normaliser une réponse API quelconque vers le format standard
 */
export function normalizeResponse<T = any>(response: any): ApiResponse<T> {
  if (!response) {
    return { success: false, message: 'Réponse vide' };
  }

  // Si la réponse a déjà la structure correcte
  if (response.success !== undefined && response.data !== undefined) {
    return response;
  }

  // Si c'est un tableau, envelopper dans data
  if (Array.isArray(response)) {
    return {
      success: true,
      data: response as unknown as T,
      count: response.length,
    };
  }

  // Si c'est un objet avec data property
  if (response.data) {
    return {
      success: true,
      data: response.data,
      message: response.message,
      count: response.count,
      pagination: response.pagination,
    };
  }

  // Sinon, traiter comme données directes
  return {
    success: true,
    data: response as unknown as T,
  };
}

/**
 * Normaliser une réponse d'erreur
 */
export function normalizeErrorResponse(error: any): ApiResponse {
  const message = 
    error?.response?.data?.message ||
    error?.message ||
    'Une erreur est survenue';

  return {
    success: false,
    message,
  };
}

/**
 * Vérifier si une réponse est valide
 */
export function isValidResponse(response: any): boolean {
  return response && (response.success === true || response.data !== undefined);
}
