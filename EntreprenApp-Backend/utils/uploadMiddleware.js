import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { getCloudinaryInstance } from './cloudinaryHelpers.js';

const cloudinary = getCloudinaryInstance();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'entreprenapp',
    resource_type: 'auto',
    allowed_formats: [
      // Images
      'jpg', 'png', 'jpeg', 'webp', 'gif', 'svg', 'bmp', 'tiff', 'ico', 'avif', 'heic', 'heif',
      // Videos
      'mp4', 'webm', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'ogv', 'm4v', 'mpg', 'mpeg', '3gp',
      // Documents
      'pdf', 'doc', 'docx', 'txt', 'xlsx', 'xls', 'ppt', 'pptx', 'odt', 'rtf'
    ],
    transformation: [{ quality: 'auto:best' }]
  }
});

// Pour les posts: jusqu'à 10 fichiers (optionnel)
const uploadMediaMiddleware = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }
}).array('media', 10); // Handle up to 10 files

export const uploadMedia = (req, res, next) => {
  uploadMediaMiddleware(req, res, (err) => {
    if (err) {
      // Si c'est une erreur de multer liée aux fichiers manquants, on continue quand même
      if (err.message && err.message.includes('Unexpected field')) {
        // C'est probablement parce qu'il n'y a pas de fichier
        req.files = [];
        return next();
      }
      // Gérer l'erreur "Stale request" (problème d'horloge système)
      if (err.message && err.message.includes('Stale request')) {
        // Continuer quand même sans fichier plutôt que de bloquer la création
        req.files = [];
        return next();
      }
      // Gérer les erreurs de timeout Cloudinary
      if (err.message && (err.message.includes('Timeout') || err.name === 'TimeoutError')) {
        // Continuer sans fichier plutôt que de bloquer
        req.files = [];
        return next();
      }
      console.error('Erreur upload média:', err.message);
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error'
      });
    }
    // Assurer que req.files est toujours un tableau
    if (!req.files) {
      req.files = [];
    }
    next();
  });
};

// Pour les événements: une seule image
const uploadEventImageMiddleware = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }
}).array('media', 1); // Handle only 1 file for events

export const uploadEventImage = (req, res, next) => {
  uploadEventImageMiddleware(req, res, (err) => {
    if (err) {
      if (err.message && err.message.includes('Unexpected field')) {
        req.files = [];
        return next();
      }
      // Gérer l'erreur "Stale request" (problème d'horloge système)
      if (err.message && err.message.includes('Stale request')) {
        // Continuer quand même sans fichier plutôt que de bloquer la création
        req.files = [];
        return next();
      }
      // Gérer les erreurs de timeout Cloudinary
      if (err.message && (err.message.includes('Timeout') || err.name === 'TimeoutError')) {
        // Continuer sans fichier plutôt que de bloquer
        req.files = [];
        return next();
      }
      console.error('Erreur upload image événement:', err.message);
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error'
      });
    }
    // Assurer que req.files est toujours un tableau
    if (!req.files) {
      req.files = [];
    }
    next();
  });
};