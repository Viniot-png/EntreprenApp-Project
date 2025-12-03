/**
 * Format standard pour toutes les réponses API
 */
export class ApiResponse {
  constructor(statusCode, data, message = 'Success', success = true) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = success;
    this.timestamp = new Date();
  }
}

/**
 * Wrapper pour gérer les erreurs dans les async handlers
 * Utilisation: asyncHandler(async (req, res, next) => { ... })
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Utilitaires pour les réponses standardisées
 */
export const sendSuccess = (res, statusCode, data, message = 'Success') => {
  return res.status(statusCode).json(new ApiResponse(statusCode, data, message, true));
};

export const sendError = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json(new ApiResponse(statusCode, data, message, false));
};

/**
 * Codes d'erreur standardisés
 */
export const ErrorCodes = {
  // Erreurs d'authentification (4xx)
  UNAUTHORIZED: { code: 401, message: 'Non authentifié' },
  FORBIDDEN: { code: 403, message: 'Accès refusé' },
  NOT_FOUND: { code: 404, message: 'Ressource non trouvée' },
  CONFLICT: { code: 409, message: 'Conflit avec les données existantes' },
  UNPROCESSABLE_ENTITY: { code: 422, message: 'Données invalides' },
  
  // Erreurs de validation
  VALIDATION_ERROR: { code: 400, message: 'Erreur de validation' },
  INVALID_INPUT: { code: 400, message: 'Entrée invalide' },
  MISSING_FIELD: { code: 400, message: 'Champ requis manquant' },
  
  // Erreurs de serveur (5xx)
  INTERNAL_SERVER_ERROR: { code: 500, message: 'Erreur serveur interne' },
  DATABASE_ERROR: { code: 500, message: 'Erreur base de données' },
  CLOUDINARY_ERROR: { code: 500, message: 'Erreur lors du traitement du média' },
  
  // Erreurs métier
  RESOURCE_OWNERSHIP_ERROR: { code: 403, message: 'Vous n\'avez pas la permission de modifier cette ressource' },
  USER_NOT_FOUND: { code: 404, message: 'Utilisateur non trouvé' },
  ALREADY_EXISTS: { code: 409, message: 'Cette ressource existe déjà' }
};

/**
 * Créer une erreur standardisée
 */
export class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
  }
}
