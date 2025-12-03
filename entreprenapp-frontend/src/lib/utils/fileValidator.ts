/**
 * Validation des fichiers uploadés
 */

const FILE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5 MB
  VIDEO: 50 * 1024 * 1024, // 50 MB
  DOCUMENT: 10 * 1024 * 1024, // 10 MB
  AVATAR: 2 * 1024 * 1024, // 2 MB
  COVER: 10 * 1024 * 1024, // 10 MB
};

const ALLOWED_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  VIDEO: ['video/mp4', 'video/mpeg', 'video/webm'],
  DOCUMENT: ['application/pdf', 'application/msword'],
  AVATAR: ['image/jpeg', 'image/png'],
  COVER: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
};

export interface FileValidationError {
  isValid: boolean;
  error?: string;
  message?: string;
}

/**
 * Valider un fichier image
 */
export function validateImage(file: File, maxSize: number = FILE_LIMITS.IMAGE): FileValidationError {
  if (!file) {
    return { isValid: false, message: 'Aucun fichier sélectionné' };
  }

  if (file.size > maxSize) {
    const maxMB = Math.round(maxSize / (1024 * 1024));
    return {
      isValid: false,
      message: `L'image ne doit pas dépasser ${maxMB}MB. Taille actuelle: ${Math.round(file.size / (1024 * 1024))}MB`,
    };
  }

  if (!ALLOWED_TYPES.IMAGE.includes(file.type)) {
    return {
      isValid: false,
      message: `Format non autorisé. Formats autorisés: JPG, PNG, GIF, WebP`,
    };
  }

  return { isValid: true };
}

/**
 * Valider un fichier vidéo
 */
export function validateVideo(file: File, maxSize: number = FILE_LIMITS.VIDEO): FileValidationError {
  if (!file) {
    return { isValid: false, message: 'Aucun fichier sélectionné' };
  }

  if (file.size > maxSize) {
    const maxMB = Math.round(maxSize / (1024 * 1024));
    return {
      isValid: false,
      message: `La vidéo ne doit pas dépasser ${maxMB}MB. Taille actuelle: ${Math.round(file.size / (1024 * 1024))}MB`,
    };
  }

  if (!ALLOWED_TYPES.VIDEO.includes(file.type)) {
    return {
      isValid: false,
      message: `Format non autorisé. Formats autorisés: MP4, MPEG, WebM`,
    };
  }

  return { isValid: true };
}

/**
 * Valider un fichier
 */
export function validateFile(
  file: File,
  type: 'image' | 'video' | 'document' | 'avatar' | 'cover' = 'image'
): FileValidationError {
  const limits = {
    image: FILE_LIMITS.IMAGE,
    video: FILE_LIMITS.VIDEO,
    document: FILE_LIMITS.DOCUMENT,
    avatar: FILE_LIMITS.AVATAR,
    cover: FILE_LIMITS.COVER,
  };

  const allowedTypes = {
    image: ALLOWED_TYPES.IMAGE,
    video: ALLOWED_TYPES.VIDEO,
    document: ALLOWED_TYPES.DOCUMENT,
    avatar: ALLOWED_TYPES.AVATAR,
    cover: ALLOWED_TYPES.COVER,
  };

  if (!file) {
    return { isValid: false, message: 'Aucun fichier sélectionné' };
  }

  if (file.size > limits[type]) {
    const maxMB = Math.round(limits[type] / (1024 * 1024));
    return {
      isValid: false,
      message: `Le fichier ne doit pas dépasser ${maxMB}MB. Taille actuelle: ${Math.round(file.size / (1024 * 1024))}MB`,
    };
  }

  if (!allowedTypes[type].includes(file.type)) {
    const formats = allowedTypes[type].map((t) => t.split('/')[1].toUpperCase()).join(', ');
    return {
      isValid: false,
      message: `Format non autorisé. Formats autorisés: ${formats}`,
    };
  }

  return { isValid: true };
}

/**
 * Formater la taille d'un fichier
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Obtenir les limites de fichier
 */
export function getFileLimits(type: 'image' | 'video' | 'document' | 'avatar' | 'cover' = 'image') {
  const limits = {
    image: FILE_LIMITS.IMAGE,
    video: FILE_LIMITS.VIDEO,
    document: FILE_LIMITS.DOCUMENT,
    avatar: FILE_LIMITS.AVATAR,
    cover: FILE_LIMITS.COVER,
  };
  return formatFileSize(limits[type]);
}
