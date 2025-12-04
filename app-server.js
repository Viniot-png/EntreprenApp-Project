import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Importer les routes du backend
import authRoute from './EntreprenApp-Backend/routes/auth.route.js';
import postRoute from './EntreprenApp-Backend/routes/post.route.js';
import commentRoute from './EntreprenApp-Backend/routes/comment.route.js';
import friendRoute from './EntreprenApp-Backend/routes/friend.route.js';
import eventRoute from './EntreprenApp-Backend/routes/event.route.js';
import projectRoute from './EntreprenApp-Backend/routes/project.route.js';
import challengeRoute from './EntreprenApp-Backend/routes/challenge.route.js';
import messageRoute from './EntreprenApp-Backend/routes/message.route.js';
import notificationRoute from './EntreprenApp-Backend/routes/notification.route.js';
import suggestionsRoute from './EntreprenApp-Backend/routes/suggestions.route.js';
import searchRoute from './EntreprenApp-Backend/routes/search.route.js';

// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API Routes
app.use('/api/auth', authRoute);
app.use('/api/event', eventRoute);
app.use('/api/message', messageRoute);
app.use('/api/post', postRoute);
app.use('/api/comment', commentRoute);
app.use('/api/friend', friendRoute);
app.use('/api/project', projectRoute);
app.use('/api/challenge', challengeRoute);
app.use('/api/notification', notificationRoute);
app.use('/api/suggestions', suggestionsRoute);
app.use('/api/search', searchRoute);

// Servir les fichiers statiques du frontend
const frontendPath = path.join(__dirname, 'entreprenapp-frontend', 'dist');
app.use(express.static(frontendPath));

// SPA fallback: rediriger toutes les routes non-API vers index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
