# Pre-Deployment Checklist

## File Structure Verification

✅ **Root Level Files**
- [ ] `package.json` - Scripts for npm run build/start
- [ ] `build.js` - Build script with path resolution
- [ ] `start.js` - Start script with path resolution  
- [ ] `server-unified.js` - Unified Express + React server
- [ ] `.env` - Environment variables (NOT in git)
- [ ] `render.yaml` or `Render.yaml` - Render deployment config
- [ ] `jest.config.cjs` - Test configuration

## Backend Configuration

✅ **EntreprenApp-Backend Structure**
- [ ] `package.json` - WITH "build": "echo 'Build handled by root build.js'"
- [ ] `server.js` - Original backend server (no longer used for build)
- [ ] `.env` - Backend env vars (referenced by root .env)
- [ ] All route files in `routes/` folder
- [ ] All controller files in `controllers/` folder
- [ ] All model files in `models/` folder
- [ ] `dbConfig/Db.js` - MongoDB connection
- [ ] `utils/` folder with all utilities

## Frontend Configuration

✅ **entreprenapp-frontend Structure**
- [ ] `package.json` - WITH "build": "vite build"
- [ ] `vite.config.ts` - Vite configuration
- [ ] `src/main.tsx` - React entry point
- [ ] `src/App.tsx` - Main React component
- [ ] `public/` - Static assets
- [ ] `dist/` - Output folder (created during build)
- [ ] `tsconfig.json` - TypeScript configuration

## Environment Variables Check

✅ **Required Environment Variables**
In Render Dashboard → Settings → Environment:

**Database:**
- [ ] `MONGODB_URI` - Full MongoDB connection string

**JWT & Auth:**
- [ ] `JWT_SECRET` - Secret key for tokens
- [ ] `JWT_EXPIRATION` - Token expiration time

**Email (SendGrid):**
- [ ] `SENDGRID_API_KEY` - SendGrid API key
- [ ] `SENDGRID_FROM_EMAIL` - From email address

**Cloud Storage (Cloudinary):**
- [ ] `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- [ ] `CLOUDINARY_API_KEY` - Cloudinary API key
- [ ] `CLOUDINARY_API_SECRET` - Cloudinary API secret

**Server Config:**
- [ ] `NODE_ENV=production`
- [ ] `PORT=3000` (or leave blank for auto-assignment)
- [ ] `FRONTEND_URL` - Frontend URL for CORS
- [ ] `BACKEND_URL` - Backend URL for frontend

**Optional:**
- [ ] `LOG_LEVEL` - Logging level (info, debug, etc.)

## Code Quality Checks

✅ **No Breaking Changes**
- [ ] No console.log left in production code
- [ ] No hardcoded URLs (use .env)
- [ ] No hardcoded API paths (check for /api/api)
- [ ] All imports are correct (check for ../../ paths)
- [ ] No unused imports

✅ **Server-unified.js**
- [ ] Imports all routes correctly
- [ ] Serves frontend from `dist/` folder
- [ ] SPA catch-all route is AFTER all /api routes
- [ ] Socket.io initialized correctly
- [ ] CORS configured for production domain
- [ ] Error handlers at the end

✅ **Build & Start Scripts**
- [ ] `build.js` finds project root correctly
- [ ] `start.js` finds project root correctly
- [ ] `npm run build` executes root build.js (not backend)
- [ ] `npm run build` verifies dist/index.html at end
- [ ] `npm start` imports server-unified.js

## Testing Before Deploy

✅ **Local Testing**
```bash
# Terminal 1: Build the app
npm run build

# Check output shows:
# ✅ Backend dependencies installed
# ✅ Frontend dependencies installed
# ✅ Frontend built
# ✅ Build completed successfully!

# Terminal 2: Start the app
npm start

# Check output shows:
# 🚀 EntreprenApp Unified Server Started
# Port: 3000
```

✅ **Manual Testing (http://localhost:3000)**
- [ ] Homepage loads
- [ ] Can navigate to /dashboard
- [ ] Can navigate to /events, /projects, /profile
- [ ] Page refresh (F5) works - no 404 on any page
- [ ] Browser console shows no errors
- [ ] Socket.io connects (check Network → WS)
- [ ] API calls work (check Network → fetch/xhr)

## Deployment Configuration

✅ **Render Settings**
- [ ] Service is set to "Node"
- [ ] Build Command: `npm run build`
- [ ] Start Command: `npm start`
- [ ] Node Version: 18+ (check package.json engines)
- [ ] Environment: production
- [ ] All env vars set in Settings

✅ **GitHub Repository**
- [ ] All changes committed to git
- [ ] Remote is connected to Render
- [ ] Latest code pushed to main branch
- [ ] No node_modules in git (check .gitignore)
- [ ] .env file is in .gitignore (NOT committed)

## Post-Deploy Verification

✅ **After Render Deployment**
1. [ ] Go to Render Dashboard
2. [ ] Click on your service
3. [ ] Wait for "Deploy successful" message
4. [ ] Check build logs for errors
5. [ ] Check runtime logs for errors
6. [ ] Visit your live URL (https://your-app.onrender.com)
7. [ ] Test basic functionality:
   - [ ] Homepage loads
   - [ ] Can log in
   - [ ] Can navigate pages
   - [ ] Page refresh works
   - [ ] No 404 errors
   - [ ] No console errors
8. [ ] Check Render logs for Socket.io connections
9. [ ] Monitor first 5 minutes for errors

## Quick Troubleshooting

If deployment fails:
1. [ ] Check Render build logs for exact error
2. [ ] Compare error with TROUBLESHOOTING.md
3. [ ] Run `npm run build` locally to reproduce
4. [ ] Fix locally, push to git
5. [ ] Trigger manual redeploy in Render

If app doesn't show content:
1. [ ] Check if 404 error appears
2. [ ] Check if server started (look for 🚀 message)
3. [ ] Check if dist/index.html exists in build logs
4. [ ] Try manual page refresh (F5)
5. [ ] Check SPA route handler in server-unified.js

If API calls fail:
1. [ ] Check if CORS origins are correct
2. [ ] Check if environment variables are set
3. [ ] Check if MongoDB connection works (check logs)
4. [ ] Check if backend routes are imported in server-unified.js

---

## Pre-Deployment Sign-Off

Before clicking "Deploy" on Render:

- [ ] All items above checked
- [ ] Local `npm run build` succeeded
- [ ] Local `npm start` shows 🚀 message
- [ ] Tested all routes locally - no 404s
- [ ] Verified environment variables in Render Settings
- [ ] Code committed to git main branch
- [ ] Render dashboard shows "Deploy successful" after push

**Ready to go live!** 🚀

---

## Emergency Rollback

If something breaks after deploy:

**Option 1: Redeploy Previous Version**
1. Find last working commit: `git log --oneline`
2. Reset: `git reset --hard <commit-hash>`
3. Push: `git push origin main --force`
4. Render auto-redeploys

**Option 2: Manual Redeploy**
1. Go to Render Dashboard
2. Click your service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Watch logs for errors

**Option 3: Disable Service**
1. Go to Render Dashboard
2. Click your service → Settings
3. Click "Suspend Service" (doesn't delete it)
4. Fix the code locally
5. Push fix and re-enable

---

*Last updated: Just before deployment*
*Next step: Push to git and trigger Render deployment*
