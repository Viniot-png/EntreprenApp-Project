import { v2 as cloudinary } from 'cloudinary';

/**
 * Initialise la configuration Cloudinary
 * À appeler une seule fois au démarrage du serveur
 */
export const initializeCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
};

/**
 * Récupère l'instance Cloudinary configurée
 * @returns {Object} Instance cloudinary v2
 */
export const getCloudinaryInstance = () => {
  return cloudinary;
};

/**
 * Récupère la configuration Cloudinary
 * @returns {Object} Configuration avec cloud_name, api_key, api_secret
 */
export const getCloudinaryConfig = () => {
  return {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  };
};
