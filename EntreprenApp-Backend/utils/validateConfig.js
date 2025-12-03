import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env');

// Charger les variables d'environnement
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.error('❌ Erreur: Fichier .env non trouvé');
  process.exit(1);
}

/**
 * Variables d'environnement requises pour la production
 */
const REQUIRED_VARS = {
  MONGO_URL: 'MongoDB Atlas Connection String',
  PORT: 'Server Port',
  NODE_ENV: 'Node Environment (development/production)',
  JWT_ACCESS_SECRET: 'JWT Access Secret Token',
  JWT_REFRESH_SECRET: 'JWT Refresh Secret Token',
  CLOUDINARY_CLOUD_NAME: 'Cloudinary Cloud Name',
  CLOUDINARY_API_KEY: 'Cloudinary API Key',
  CLOUDINARY_API_SECRET: 'Cloudinary API Secret',
  SENDGRID_API_KEY: 'SendGrid API Key',
  SENDGRID_FROM_EMAIL: 'SendGrid From Email',
  TWILIO_API_KEY_SID: 'Twilio API Key SID',
  TWILIO_API_KEY_SECRET: 'Twilio API Key Secret',
};

/**
 * Variables optionnelles
 */
const OPTIONAL_VARS = {
  FRONTEND_URL: 'Frontend URL',
  EMAIL_USER: 'Email User',
  SMTP_HOST: 'SMTP Host',
  SMTP_PORT: 'SMTP Port',
};

/**
 * Valide les variables d'environnement
 */
export const validateConfig = () => {
  console.log('\n🔍 Verification de la configuration...\n');

  let isValid = true;
  const missingVars = [];
  const warnings = [];

  // Vérifier les variables requises
  for (const [key, description] of Object.entries(REQUIRED_VARS)) {
    const value = process.env[key];
    if (!value) {
      isValid = false;
      missingVars.push(`ERREUR ${key}: ${description}`);
    } else {
      console.log(`OK ${key}: Configure (${value.length} chars)`);
    }
  }

  // Vérifier les variables optionnelles
  console.log('\nVariables optionnelles:');
  for (const [key, description] of Object.entries(OPTIONAL_VARS)) {
    if (!process.env[key]) {
      warnings.push(`ATTENTION ${key}: ${description} (non configure)`);
    } else {
      console.log(`OK ${key}: Configure`);
    }
  }

  // Afficher les avertissements
  if (warnings.length > 0) {
    console.log('\n' + warnings.join('\n'));
  }

  // Vérifications supplémentaires
  console.log('\nVerifications de securite:');

  // Vérifier la longueur des secrets JWT
  if (process.env.JWT_ACCESS_SECRET && process.env.JWT_ACCESS_SECRET.trim().length < 32) {
    isValid = false;
    console.log('ERREUR JWT_ACCESS_SECRET: Doit avoir au moins 32 caracteres');
  } else if (process.env.JWT_ACCESS_SECRET) {
    console.log('OK JWT_ACCESS_SECRET: Longueur suffisante');
  }

  if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.trim().length < 32) {
    isValid = false;
    console.log('ERREUR JWT_REFRESH_SECRET: Doit avoir au moins 32 caracteres');
  } else if (process.env.JWT_REFRESH_SECRET) {
    console.log('OK JWT_REFRESH_SECRET: Longueur suffisante');
  }

  // Vérifier que NODE_ENV est correct
  const validEnv = ['development', 'production', 'testing'];
  if (!validEnv.includes(process.env.NODE_ENV)) {
    isValid = false;
    console.log(`ERREUR NODE_ENV: Doit etre l'un de: ${validEnv.join(', ')}`);
  } else {
    console.log(`OK NODE_ENV: ${process.env.NODE_ENV}`);
  }

  // Vérifier que PORT est un nombre
  if (process.env.PORT && isNaN(parseInt(process.env.PORT))) {
    isValid = false;
    console.log('ERREUR PORT: Doit etre un nombre');
  } else if (process.env.PORT) {
    console.log(`OK PORT: ${process.env.PORT}`);
  }

  // Vérifier la connexion MongoDB
  if (process.env.MONGO_URL) {
    if (process.env.MONGO_URL.startsWith('mongodb+srv://')) {
      console.log('OK MONGO_URL: Atlas configure');
    } else if (process.env.MONGO_URL.startsWith('mongodb://')) {
      console.log('ATTENTION MONGO_URL: Connexion locale (non recommandee pour la production)');
    } else {
      isValid = false;
      console.log('ERREUR MONGO_URL: Format invalide');
    }
  }

  // Résumé final
  console.log('\n' + '='.repeat(50));
  if (isValid) {
    console.log('OK Configuration valide! Pret pour le deploiement.');
  } else {
    console.log('ERREUR Erreurs de configuration detectees!');
    if (missingVars.length > 0) {
      console.log('\nVariables manquantes:');
      console.log(missingVars.join('\n'));
    }
  }
  console.log('='.repeat(50) + '\n');

  return isValid;
};

// Exécuter si lancé directement (comme script npm run validate-config)
if (import.meta.url === `file://${process.argv[1]}`) {
  validateConfig();
  process.exit(0);
}
