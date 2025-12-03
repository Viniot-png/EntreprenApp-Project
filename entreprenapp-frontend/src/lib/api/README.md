# Documentation de l'API

Ce dossier contient toute la logique de communication avec le backend de l'application EntreprenApp.

## Structure

```
src/lib/api/
├── config.ts          # Configuration de l'API (URLs, endpoints)
├── client.ts          # Client HTTP avec intercepteurs
└── services/         # Services API par ressource
    ├── auth.service.ts
    ├── post.service.ts
    ├── message.service.ts
    ├── friend.service.ts
    ├── event.service.ts
    ├── comment.service.ts
    ├── project.service.ts
    ├── challenge.service.ts
    └── index.ts       # Export centralisé
```

## Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet avec :

```env
VITE_API_BASE_URL=http://localhost:3000
```

Par défaut, l'URL de base est `http://localhost:3000` si la variable n'est pas définie.

### Configuration CORS

Le backend doit être configuré pour accepter les requêtes depuis le frontend. Le CORS a été mis à jour pour inclure le port 8080.

## Utilisation

### Import des services

```typescript
import { authService, postService, messageService } from '@/lib/api/services';
```

### Authentification

```typescript
import { useAuth } from '@/hooks/useAuth';

const { user, login, logout, register, isAuthenticated } = useAuth();

// Connexion
await login({ email: 'user@example.com', password: 'password' });

// Inscription
await register({
  username: 'johndoe',
  fullname: 'John Doe',
  email: 'john@example.com',
  password: 'password',
  role: 'entrepreneur',
});

// Déconnexion
await logout();
```

### Posts

```typescript
import { postService } from '@/lib/api/services';

// Créer un post
const newPost = await postService.createPost({
  content: 'Mon nouveau post',
  visibility: 'public',
  media: [file1, file2], // Optionnel
});

// Obtenir les posts publics
const posts = await postService.getPublicPosts();

// Aimer un post
await postService.likePost(postId);

// Supprimer un post
await postService.deletePost(postId);
```

### Messages

```typescript
import { messageService } from '@/lib/api/services';

// Obtenir une conversation
const messages = await messageService.getConversation(userId);

// Envoyer un message
await messageService.sendMessage(userId, {
  text: 'Bonjour !',
  image: base64String, // Optionnel
});
```

### Amis

```typescript
import { friendService } from '@/lib/api/services';

// Obtenir la liste des amis
const friends = await friendService.getFriends();

// Envoyer une demande d'ami
await friendService.sendFriendRequest({ receiverId: userId });

// Répondre à une demande
await friendService.respondToFriendRequest(requestId, {
  action: 'accepted' // ou 'rejected'
});
```

### Événements

```typescript
import { eventService } from '@/lib/api/services';

// Obtenir tous les événements
const events = await eventService.getEvents();

// Créer un événement
await eventService.createEvent({
  title: 'Conférence Tech',
  description: '...',
  seats: 100,
  startDate: '2024-12-01T10:00:00Z',
  endDate: '2024-12-01T18:00:00Z',
  location: 'Paris',
});

// S'inscrire à un événement
await eventService.registerToEvent(eventId);
```

### Commentaires

```typescript
import { commentService } from '@/lib/api/services';

// Obtenir les commentaires d'un post
const comments = await commentService.getCommentsByPost(postId);

// Ajouter un commentaire
await commentService.addComment(postId, {
  content: 'Excellent post !',
});
```

### Projets

```typescript
import { projectService } from '@/lib/api/services';

// Obtenir tous les projets
const projects = await projectService.getProjects();

// Créer un projet
await projectService.createProject({
  title: 'Mon Startup',
  description: '...',
  sector: 'Tech',
  stage: 'Idea',
  fundingGoal: 50000,
});

// Investir dans un projet
await projectService.investInProject(projectId, {
  amount: 1000,
});
```

### Défis

```typescript
import { challengeService } from '@/lib/api/services';

// Obtenir tous les défis
const challenges = await challengeService.getChallenges();

// Postuler à un défi
await challengeService.applyToChallenge(challengeId);
```

## Client HTTP

Le client HTTP (`client.ts`) gère automatiquement :

- **Authentification** : Envoi des cookies et tokens
- **Refresh Token** : Rafraîchissement automatique en cas d'expiration
- **Gestion d'erreurs** : Transformation des erreurs HTTP en erreurs JavaScript
- **Upload de fichiers** : Support pour FormData

### Méthodes disponibles

```typescript
import apiClient from '@/lib/api/client';

// GET
const data = await apiClient.get('/api/endpoint');

// POST
const result = await apiClient.post('/api/endpoint', { data });

// PUT
const updated = await apiClient.put('/api/endpoint', { data });

// DELETE
await apiClient.delete('/api/endpoint');

// Upload de fichiers (FormData)
const formData = new FormData();
formData.append('file', file);
const result = await apiClient.postFormData('/api/upload', formData);
```

## Gestion des erreurs

Toutes les erreurs sont automatiquement transformées en objets `Error` avec un message descriptif. Les erreurs 401 (non autorisé) déclenchent automatiquement une tentative de rafraîchissement du token.

## Types TypeScript

Tous les types sont exportés depuis `services/index.ts` :

```typescript
import type {
  User,
  Post,
  Message,
  Event,
  Comment,
  Project,
  Challenge,
  // ... et bien d'autres
} from '@/lib/api/services';
```

## Notes importantes

1. **Cookies** : L'authentification utilise des cookies HTTP-only, gérés automatiquement par le navigateur grâce à `withCredentials: true`.

2. **Refresh Token** : Le refresh token est géré automatiquement par le client. En cas d'échec, l'utilisateur est déconnecté automatiquement.

3. **Upload de fichiers** : Utilisez les méthodes `postFormData` ou `putFormData` pour les uploads, ou passez un `FormData` directement aux services.

4. **Variables d'environnement** : N'oubliez pas de créer un fichier `.env` avec `VITE_API_BASE_URL` pour configurer l'URL du backend.

