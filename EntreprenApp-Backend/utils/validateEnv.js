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
    console.warn('⚠️  Variables d\'environnement manquantes:', missing.join(', '));
    console.warn('   Note: Elles peuvent être définies via votre plateforme de déploiement (Render, etc)');
    // Ne pas faire process.exit(1) pour permettre à Render de charger les variables
  } else {
    console.log('✅ Toutes les variables d\'environnement requises sont présentes');
  }
};

export default validateEnv;
