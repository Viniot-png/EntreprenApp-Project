import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const distPath = path.join(__dirname, 'dist');

// Servir les fichiers statiques avec cache long-term pour les assets
app.use(express.static(distPath, {
  maxAge: '1y',
  etag: false
}));

// Pour les fichiers HTML, pas de cache
app.use(express.static(distPath, {
  index: false
}));

// Rediriger toutes les routes vers index.html (SPA routing)
// Sauf les requêtes API (celles-ci 404 normalement)
app.get('*', (req, res, next) => {
  // Si c'est une requête API (commence par /api), laisser aller au 404 normalement
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  // Sinon, servir index.html pour que React Router gère le routing
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Server error');
    }
  });
});

// 404 handler pour API
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found'
  });
});

const PORT = process.env.PORT || 5173;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Frontend server running on port ${PORT}`);
  console.log(`📁 Serving static files from: ${distPath}`);
});
