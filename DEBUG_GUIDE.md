# 🔍 Guide de Debugging - Logs et Problèmes

## 📋 Nouveaux Logs Détaillés Ajoutés

### 1. **Socket.IO Logs**

#### Connection réussie:
```
✅ [Socket] New client connected: 7KZwBBWwa-3bnidFAAAB
   User ID: 123
   Headers: {...}
   ✅ User 123 added to onlineUsers. Total online: 1
```

#### Déconnexion:
```
❌ [Socket] Client disconnected: 7KZwBBWwa-3bnidFAAAB
   Reason: transport close
   User ID: 123
   ✅ User 123 removed from onlineUsers. Total online: 0
```

**Ce que cela signifie:**
- Si tu vois `transport close` → La connexion HTTP/WebSocket a été fermée
- Si tu vois `disconnect` immédiatement après `connection` → C'est un problème de reconnection

---

### 2. **HTTP Request Logs**

#### Requête réussie:
```
✅ [HTTP] GET /dashboard → 200 (45ms)
```

#### Erreur 404:
```
🔴 [HTTP] GET /api/user → 404 (5ms)
   Headers: {...}
   Body: {...}
```

#### SPA Fallback (normal):
```
📍 [SPA] Handling route: /dashboard
   Method: GET
   User-Agent: Mozilla/5.0...
   Cookies: token=abc123...
   Auth header: Present
   Serving from: /path/to/dist/index.html
   ✅ Successfully served index.html for /dashboard
```

---

### 3. **Frontend Build Verification**

Au démarrage du serveur, tu verras:
```
📁 Frontend Configuration:
   Dist path: /app/entreprenapp-frontend/dist
   ✅ index.html found
   Dist directory: ✅ exists
   Files in dist: index.html, style.js, chunk-123.js...
```

**Si tu vois une erreur:**
```
❌ index.html NOT found at /app/entreprenapp-frontend/dist/index.html
❌ Dist directory: missing
```
→ Cela signifie que le frontend n'a pas été builté. Solution: `npm run build` dans `entreprenapp-frontend/`

---

## 🐛 Problème: Refresh affiche "404"

### Symptômes:
```
📍 [SPA] Handling route: /dashboard
   ❌ Error serving index.html: ENOENT: no such file...
```

### Causes possibles:

**1. Frontend non builté:**
```bash
cd entreprenapp-frontend
npm run build
```

**2. Chemin incorrect de dist:**
```
❌ Dist directory: missing
→ Vérifier que le build a créé le dossier dist/
```

**3. Index.html corrompu:**
```
✅ index.html found (mais fichier vide ou invalide)
→ Rebuild: npm run build
```

---

## 📍 Problème: Socket reconnecte à chaque refresh

### Symptômes:
```
✅ [Socket] New client connected: 7KZwBBWwa-3bnidFAAAB
   User ID: 123
❌ [Socket] Client disconnected: 7KZwBBWwa-3bnidFAAAB
   Reason: transport close
✅ [Socket] New client connected: 8LBxCCXxc-4cojeFBBBC
   User ID: 123
```

### Causes:

**1. React remonte le composant au refresh:**
```
Normal! Le Socket se reconnecte car React redémarre.
Cela n'est problématique que si le reconnection est lent.
```

**2. Cookies d'authentification perdus:**
```
📍 [SPA] Handling route: /dashboard
   Cookies: {} ← Vide!
   Auth header: Missing
→ L'utilisateur n'est plus authentifié après le refresh
```

**Solution:** Vérifier que les cookies persistent:
- `withCredentials: true` dans axios
- `sameSite: 'none'` + `secure: true` en production

**3. Token JWT expiré:**
```
Si le token est expiré, le backend refuse l'authentification.
Solution: Implémenter token refresh automatique.
```

---

## ✅ Checklist de Debug

Après avoir vu les logs, vérifier:

- [ ] **Frontend builté?**
  ```
  ls -la entreprenapp-frontend/dist/index.html
  ```

- [ ] **Serveur démarre sans erreur?**
  ```
  ✅ Frontend: Served from dist/
  ✅ Backend: API routes on /api
  ✅ Socket.io: Enabled with logging
  ```

- [ ] **Refresh affiche le log SPA?**
  ```
  📍 [SPA] Handling route: /dashboard
  ✅ Successfully served index.html
  ```

- [ ] **Cookies persistent après refresh?**
  ```
  📍 [SPA] ... Cookies: token=abc123...
  ```

- [ ] **Socket se reconnecte (normal)?**
  ```
  ❌ Client disconnected
  ✅ New client connected
  ```

---

## 🔧 Pour Tester Localement

```bash
# 1. Build frontend
cd entreprenapp-frontend
npm run build
cd ..

# 2. Start unified server avec logs
node server-unified.js

# 3. Watch logs
# Tous les logs apparaîtront dans le terminal

# 4. Tester
# Ouvre http://localhost:3000
# Login
# Refresh (F5)
# Regarde les logs pour voir exactement ce qui se passe
```

---

## 📊 Log Codes de Couleur

| Symbole | Signification |
|---------|---------------|
| ✅ | Succès |
| ❌ | Erreur |
| 🔴 | Critique |
| ⚠️ | Attention |
| 📍 | Informationnel |
| 🔗 | Routes API |
| 📁 | Fichiers/Dossiers |

---

## 🚨 Erreurs Courantes et Solutions

### "index.html NOT found"
```bash
# Solution:
cd entreprenapp-frontend
npm install
npm run build
```

### "Error: ENOENT: no such file or directory"
```bash
# Vérifier le chemin:
ls -la server-unified.js
ls -la entreprenapp-frontend/dist/index.html

# Vérifier qu'on est au bon répertoire:
pwd  # Devrait être le root du projet
```

### "CORS error" sur Socket.io
```bash
# Vérifier les corsOrigins dans server-unified.js:
console.log(corsOrigins);

# Ajouter le domaine frontend si manquant
```

### "Cannot GET /dashboard"
```bash
# Vérifier que le fallback SPA est bien activé:
# Dans les logs, tu dois voir:
# 📍 [SPA] Handling route: /dashboard
# ✅ Successfully served index.html

# Si tu vois: 🔴 [HTTP] GET /dashboard → 404
# Cela signifie que le fallback n'a pas intercepté la route
# → Vérifier que app.get('*') est APRÈS les routes /api/*
```

---

## 💡 Prochaines Étapes

1. **Deploy sur Render avec ces logs:**
   - Les logs apparaîtront dans Render > Logs
   - Regarde-les pour identifier le problème exact

2. **Share les logs détaillés pour help:**
   - Copie les logs de la console
   - Partage-les pour qu'on analyse ensemble

3. **Teste les cas:**
   - Refresh multiple fois
   - Ferme et rouvre le navigateur
   - Teste avec différents navigateurs
