import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config()

export const DbConnection = async () => {
  const maxRetries = 5;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGO_URL, {
        maxPoolSize: process.env.NODE_ENV === 'production' ? 50 : 20,
        minPoolSize: process.env.NODE_ENV === 'production' ? 10 : 5,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000,
      });
      console.log('✅ MongoDB connecté avec succès');
      return;
    } catch (error) {
      retryCount++;
      const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 2s, 4s, 8s, 16s, 32s
      
      console.warn(`⚠️  Tentative de connexion ${retryCount}/${maxRetries}. Nouvelle tentative dans ${delay}ms...`);
      console.warn(`   Erreur: ${error.message}`);
      
      if (retryCount >= maxRetries) {
        console.error(`❌ Impossible de connecter MongoDB après ${maxRetries} tentatives. Arrêt du serveur.`);
        process.exit(1);
      }
      
      // Attendre avant de réessayer
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};