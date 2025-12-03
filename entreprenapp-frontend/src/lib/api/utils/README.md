# Utilitaires API - Adaptateurs de données

Ce dossier contient les utilitaires pour adapter les données entre le format frontend et backend.

## Problème résolu

Le frontend et le backend utilisent parfois des noms de champs différents :

- **Frontend** : `name`, `firstName`, `lastName`, `avatar`
- **Backend** : `fullname`, `username`, `profileImage`

## Solution : Adaptateurs

Les adaptateurs dans `userAdapter.ts` convertissent automatiquement les données :

### `backendToFrontendUser(backendUser)`

Convertit un utilisateur du backend vers le format frontend :

```typescript
import { backendToFrontendUser } from '@/lib/api/utils/userAdapter';

const backendUser = {
  _id: '123',
  fullname: 'John Doe',
  username: 'johndoe',
  profileImage: { url: 'https://...' }
};

const frontendUser = backendToFrontendUser(backendUser);
// Résultat :
// {
//   id: '123',
//   name: 'John Doe',  // ← fullname devient name
//   username: 'johndoe',
//   avatar: 'https://...',  // ← profileImage.url devient avatar
//   profileImage: 'https://...',
//   ...
// }
```

### `frontendToBackendRegisterData(frontendData)`

Convertit les données d'inscription du frontend vers le format backend :

```typescript
import { frontendToBackendRegisterData } from '@/lib/api/utils/userAdapter';

const frontendData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'password123',
  role: 'entrepreneur'
};

const backendData = frontendToBackendRegisterData(frontendData);
// Résultat :
// {
//   username: 'john',  // ← généré depuis l'email
//   fullname: 'John Doe',  // ← firstName + lastName
//   email: 'john@example.com',
//   password: 'password123',
//   role: 'entrepreneur'
// }
```

### `frontendToBackendUpdateProfileData(frontendData)`

Convertit les données de mise à jour de profil :

```typescript
import { frontendToBackendUpdateProfileData } from '@/lib/api/utils/userAdapter';

const frontendData = {
  name: 'John Doe',  // ← sera converti en fullname
  bio: 'My bio',
  location: 'Paris'
};

const backendData = frontendToBackendUpdateProfileData(frontendData);
// Résultat :
// {
//   fullname: 'John Doe',
//   bio: 'My bio',
//   location: 'Paris'
// }
```

## Utilisation automatique

Les services API utilisent automatiquement ces adaptateurs, donc vous pouvez utiliser les formats frontend directement :

```typescript
import { authService } from '@/lib/api/services';

// ✅ Fonctionne avec firstName/lastName
await authService.register({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'password',
  role: 'entrepreneur'
});

// ✅ Fonctionne aussi avec fullname/username
await authService.register({
  username: 'johndoe',
  fullname: 'John Doe',
  email: 'john@example.com',
  password: 'password',
  role: 'entrepreneur'
});

// ✅ Les réponses sont automatiquement converties au format frontend
const profile = await authService.getProfile();
console.log(profile.data.name);  // ← utilise "name" même si le backend retourne "fullname"
console.log(profile.data.avatar);  // ← utilise "avatar" même si le backend retourne "profileImage"
```

## Types disponibles

```typescript
import type {
  FrontendUser,
  FrontendRegisterData,
  FrontendUpdateProfileData,
} from '@/lib/api/services';
```

