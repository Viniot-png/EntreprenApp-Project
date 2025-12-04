# 🔧 Configuration Render - Instructions EXACTES

## Service: `entreprenapp-backend`

Copie-colle ces valeurs **EXACTEMENT** dans Render Dashboard:

### Build Command
```
npm run build
```

### Pre-Deploy Command (Optional)
```
(laisser vide)
```

### Start Command
```
npm start
```

### Environment
- **Type:** Node.js
- **Region:** Choose closest to you
- **Plan:** Standard

### Environment Variables
Les variables d'environnement sont déjà configurées dans le Dashboard Render.
Ne les change PAS - elles contiennent les clés API sensibles.

Liste des variables requises (pour référence):
- NODE_ENV=production
- MONGO_URL=**(déjà configuré)**
- FRONTEND_URL=https://entrepreneurapp-backend-byvn.onrender.com
- JWT_ACCESS_SECRET=**(déjà configuré)**
- JWT_REFRESH_SECRET=**(déjà configuré)**
- SENDGRID_API_KEY=**(déjà configuré)**
- SENDGRID_FROM_EMAIL=brugeonmadiba@gmail.com
- SENDGRID_FROM_NAME=EntreprenApp
- CLOUDINARY_CLOUD_NAME=dnef4y9m7
- CLOUDINARY_API_KEY=**(déjà configuré)**
- CLOUDINARY_API_SECRET=**(déjà configuré)**
- TWILIO_API_KEY_SID=**(déjà configuré)**
- TWILIO_API_KEY_SECRET=**(déjà configuré)**
- VITE_API_BASE_URL=https://entrepreneurapp-backend-byvn.onrender.com
- VITE_SOCKET_URL=https://entrepreneurapp-backend-byvn.onrender.com

---

## ⚠️ IMPORTANT: Service `entrepreneurapp-web`

**À SUPPRIMER ou SUSPENDRE:**
- Ce service n'est plus utilisé
- Tout fonctionne sur `entrepreneurapp-backend` maintenant
- Garder les deux coûte de l'argent inutilement

---

## 🔄 Processus de déploiement

1. **Push code vers GitHub** (déjà fait)
   ```bash
   git push origin main
   ```

2. **Va sur Render Dashboard**
   - https://dashboard.render.com

3. **Pour le service `entrepreneurapp-backend`:**
   - Clique sur le service
   - Onglet "Settings"
   - Scroll vers le bas

4. **Change les commandes:**
   ```
   Build Command: bash render-build.sh
   Start Command: bash render-start.sh
   ```

5. **Sauvegarde et redéploie**
   - Clique "Deploy" ou "Redeploy"
   - Attends 3-5 minutes

6. **Test:**
   ```
   https://entrepreneurapp-backend-byvn.onrender.com
   → Login
   → Dashboard
   → F5 Refresh
   → ✅ Affiche dashboard (PAS 404)
   ```

---

## 📋 Checklist avant déploiement

- [ ] Code pushé vers GitHub (main branch)
- [ ] Render Dashboard ouvert
- [ ] Service `entrepreneurapp-backend` sélectionné
- [ ] Build Command: `bash render-build.sh`
- [ ] Start Command: `bash render-start.sh`
- [ ] Environment variables vérifiées (ne pas toucher aux secrets)
- [ ] Redéploiement lancé

---

## 🐛 Si ça ne marche pas

### Les logs à vérifier dans Render:

1. **Build fails:**
   - Logs montreront l'erreur npm
   - Vérifier que `render-build.sh` existe

2. **App crashes at start:**
   - Logs montreront l'erreur Node.js
   - Vérifier que `server-unified.js` peut importer les routes

3. **404 au refresh:**
   - Vérifier que `app.get('*')` dans `server-unified.js` redirige vers index.html

---

## 🔍 Debug Commands (Si besoin)

```bash
# Tester localement avant déploiement:
bash render-build.sh   # Simule le build
bash render-start.sh   # Simule le démarrage

# Vérifier que les fichiers existent:
ls -la render-*.sh
ls -la server-unified.js
ls -la EntreprenApp-Backend/server.js
ls -la entreprenapp-frontend/dist/index.html
```

---

## ✅ Configuration finale résumée

| Paramètre | Valeur |
|-----------|--------|
| Service | `entreprenapp-backend` |
| Build | `bash render-build.sh` |
| Start | `bash render-start.sh` |
| Node version | 18+ (automatique) |
| Port | 3000 (défaut) |
| Frontend | Inclus dans `dist/` |
| API | Sur `/api/*` |
