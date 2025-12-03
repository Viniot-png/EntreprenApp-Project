import dotenv from 'dotenv';

dotenv.config();

export const validateEnv = () => {
  const required = [
    'MONGO_URL',
    'JWT_ACCESS_SECRET', 
    'JWT_REFRESH_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];

  const missing = required.filter(v => !process.env[v]);

  if (missing.length > 0) {
    console.error('❌ Variables d\'environnement manquantes:', missing.join(', '));
    process.exit(1);
  }

  console.log('✅ Toutes les variables d\'environnement requises sont présentes');
};

export default validateEnv;
