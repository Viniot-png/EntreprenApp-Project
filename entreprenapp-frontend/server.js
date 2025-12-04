import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'dist')));

// Rediriger toutes les routes non-fichier vers index.html (SPA routing)
app.get('*', (req, res) => {
  // Si ce n'est pas une route API ou un fichier statique, servir index.html
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  }
});

const PORT = process.env.PORT || 5173;
app.listen(PORT, () => {
  console.log(`✅ Frontend server running on port ${PORT}`);
});
