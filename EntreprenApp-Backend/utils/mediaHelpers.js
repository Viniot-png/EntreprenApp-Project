import { v2 as cloudinary } from 'cloudinary';

/**
 * Extract public ID from file object
 * Handles multiple file object formats from Cloudinary and other sources
 */
export const extractPublicId = (file) => {
  if (!file) return null;
  
  // Direct public_id property (most common from Cloudinary)
  if (file.public_id) return file.public_id;
  
  // Fallback properties
  if (file.filename) return file.filename;
  if (file.publicId) return file.publicId;
  
  // Extract from path URL
  if (file.path) {
    const parts = file.path.split('/');
    const filenamePart = parts[parts.length - 1];
    return filenamePart.split('.')[0];
  }
  
  // Extract from full URL
  if (file.url) {
    const parts = file.url.split('/');
    const filenamePart = parts[parts.length - 1];
    return filenamePart.split('.')[0];
  }
  
  return null;
};

/**
 * Delete media from Cloudinary
 * @param {string} mediaUrl - URL of the media to delete
 * @param {string} mediaType - Type of media ('image', 'video', 'raw', 'auto')
 */
export const deleteFromCloudinary = async (mediaUrl, mediaType = 'auto') => {
  try {
    if (!mediaUrl) return false;
    
    const publicId = extractPublicId({ url: mediaUrl });
    if (!publicId) {
      console.warn('⚠️ Could not extract publicId from URL:', mediaUrl);
      return false;
    }
    
    const result = await cloudinary.uploader.destroy(publicId, { 
      resource_type: mediaType 
    });
    
    if (result.result === 'ok') {
      console.log(`✅ Deleted from Cloudinary: ${publicId}`);
      return true;
    }
    
    return false;
  } catch (err) {
    console.error('❌ Error deleting from Cloudinary:', err.message);
    return false;
  }
};

/**
 * Upload media to Cloudinary
 * @param {object} file - File object from middleware
 * @param {string} folder - Folder name in Cloudinary
 * @param {string} resourceType - Type of resource (image, video, auto)
 * @returns {object} - { url, publicId } or null
 */
export const uploadToCloudinary = async (file, folder = 'entrepienapp', resourceType = 'auto') => {
  try {
    if (!file) return null;
    
    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: resourceType,
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type
    };
  } catch (err) {
    console.error('❌ Error uploading to Cloudinary:', err.message);
    return null;
  }
};

export default {
  extractPublicId,
  deleteFromCloudinary,
  uploadToCloudinary
};
