import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'entreprenapp',
    resource_type: 'auto', 
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif', 'svg', 'bmp', 'tiff', 'ico', 'avif', 'heic', 'heif'],
    format: async (req, file) => {
    
      const format = file.originalname.split('.').pop().toLowerCase();
      return format;
    },
    transformation: [{ quality: 'auto:best' }] 
  }
});


const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB file size limit
  },
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
});

export default upload;