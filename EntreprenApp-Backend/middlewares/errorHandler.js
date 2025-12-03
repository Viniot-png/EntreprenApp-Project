import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiResponse.js';

/**
 * Middleware global de gestion des erreurs
 * Doit être le dernier middleware du serveur
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Si ce n'est pas une ApiError, la convertir
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Erreur serveur interne';

    error = new ApiError(statusCode, message);
  }

  const response = new ApiResponse(
    error.statusCode,
    null,
    error.message,
    false
  );

  // Ajouter les détails d'erreur si disponibles (développement)
  if (error.errors && error.errors.length > 0) {
    response.errors = error.errors;
  }

  // Log des erreurs
  if (error.statusCode >= 500) {
    console.error('❌ ERREUR SERVEUR:', {
      message: error.message,
      statusCode: error.statusCode,
      timestamp: new Date(),
      path: req.path,
      method: req.method
    });
  }

  return res.status(error.statusCode).json(response);
};

/**
 * Middleware pour capturer les routes 404
 */
export const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Route ${req.path} non trouvée`);
  next(error);
};
