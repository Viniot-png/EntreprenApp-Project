# Render Deployment Troubleshooting Guide

## Common Build Errors and Solutions

### Error 1: `Cannot find package 'express'`
**Error Message:**
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'express' 
imported from /opt/render/project/src/EntreprenApp-Backend/server.js
```

**Cause:** Backend build script executed before dependencies installed

**Solution:** ✅ ALREADY FIXED
- Backend `package.json` build script is now a no-op: `echo 'Build handled by root build.js'`
- Root `package.json` has proper build script that installs deps first

---

### Error 2: `Cannot find module 'server-unified.js'`
**Error Message:**
```
Cannot find module './server-unified.js'
```

**Cause:** `start.js` can't find project root

**Diagnosis:**
1. Check Render logs for: `Initial directory: /opt/render/...`
2. Check if it successfully climbs to project root

**Solution:**
- Verify `server-unified.js` exists at project root
- Check that `EntreprenApp-Backend/package.json` exists (used as marker)
- If still failing, the directory structure might be different on Render

---

### Error 3: `Cannot find package in dist/`
**Error Message:**
```
Error: Cannot find package in dist/ or 
file not found: index.html
```

**Cause:** Frontend build didn't create dist/ folder or index.html

**Diagnosis:**
1. Look for in build logs: `✅ Frontend build verified - index.html found`
2. If not found, check: `🔨 Step 3: Building frontend...`

**Solution:**
- Verify Vite build succeeded in logs
- Check that `entreprenapp-frontend/package.json` has `"build": "vite build"`
- Ensure TypeScript compiles without errors

---

### Error 4: Application starts but shows 404
**Error Message:**
- Visit `https://your-app.onrender.com/dashboard`
- Get: "Cannot GET /dashboard"

**Cause:** SPA routing not working - server not serving index.html for non-API routes

**Diagnosis:**
1. Check logs for: `📍 [SPA] Handling route:` messages
2. Check if `dist/index.html` verification passed during build

**Solution:**
- Check `server-unified.js` line ~250-275 (SPA catch-all route)
- Verify route is: `app.get('*', (req, res) => { ... })`
- This should be the LAST route before error handlers
- Make sure it comes AFTER all `/api/*` routes

---

### Error 5: Socket.io not connecting
**Error Message:**
- Browser console: `WebSocket connection to 'ws://...' failed`
- Or: "Socket disconnected"

**Cause:** Socket.io not initialized correctly or CORS issue

**Diagnosis:**
1. Check logs for: `✅ [Socket] New client connected:` messages
2. Check browser Network tab → WebSocket connections
3. Check if CORS is configured for your domain

**Solution:**
- In `server-unified.js`, verify Socket.io initialization around line 100-120
- Check CORS origins in server initialization
- Ensure your Render domain is in CORS whitelist

---

## Checking Build Success

### What to Look For in Render Logs

**Successful Build Sequence:**
```
$ npm run build
  > entrepreneurapp@1.0.0 build
  > node build.js

  🏗️  EntreprenApp Build Script
  Initial directory: /opt/render/project/src/...
  Project root: /opt/render/project/src/...
  
  📦 Step 1: Installing backend dependencies...
     Path: .../EntreprenApp-Backend
     ✅ Backend dependencies installed
  
  📦 Step 2: Installing frontend dependencies...
     Path: .../entreprenapp-frontend
     ✅ Frontend dependencies installed
  
  🔨 Step 3: Building frontend...
     > vite build
     ✓ X modules transformed...
     ✓ built in 45s
  
  ✅ Build completed successfully!
```

**Successful Start Sequence:**
```
$ npm start
  > entrepreneurapp@1.0.0 start
  > node start.js

  🚀 Starting EntreprenApp Server
  Initial directory: /opt/render/project/src/...
  Project root: /opt/render/project/src/...
  Working directory: /opt/render/project/src/...
  Loading server from: .../server-unified.js
  
  🚀 EntreprenApp Unified Server Started
  Port: 3000
  Environment: production
  ✅ Frontend build verified - index.html found
```

---

## Testing After Deployment

### 1. API Routes
```bash
curl https://your-app.onrender.com/api/auth/verify
# Should return JSON (with or without error)
```

### 2. SPA Routes
```bash
# Visit these URLs - should NOT show 404
https://your-app.onrender.com/
https://your-app.onrender.com/dashboard
https://your-app.onrender.com/events
https://your-app.onrender.com/profile

# Refresh each page with F5 - should still work
```

### 3. Socket.io Connection
```javascript
// Open browser DevTools Console
// Look for socket connection logs in your app
// Socket should show as "Connected"
```

### 4. Check Server Logs
- Go to Render Dashboard → Your Service → Logs
- Should see HTTP requests with status codes: `✅ GET /dashboard → 200 (45ms)`
- Should see Socket.io connections: `✅ [Socket] New client connected: socket-id`

---

## If Something Still Goes Wrong

### Step 1: Check Render Logs
- Open your service in Render Dashboard
- Click "Logs" tab
- Look for first error message
- Share this error message if asking for help

### Step 2: Verify Local Build
- Run locally: `npm run build`
- Check for errors in terminal output
- Verify `dist/index.html` exists after build

### Step 3: Check Environment Variables
- Go to Render Dashboard → Settings
- Verify all environment variables are set:
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `SENDGRID_API_KEY`
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
  - `NODE_ENV=production`
  - `PORT=3000` (should auto-set, but verify)

### Step 4: Manual Redeploy
- In Render Dashboard, click "Manual Deploy"
- Trigger a fresh build from latest code
- Watch build logs for errors

---

## Quick Reference

| Problem | Check | Log Pattern |
|---------|-------|-------------|
| Build fails | npm install logs | `❌ Backend dependencies installed` or `npm ERR!` |
| Frontend not built | Vite build logs | `✓ built in` or `error during build` |
| SPA route shows 404 | Server logs | `📍 [SPA] Handling route:` should appear |
| Socket won't connect | Browser console | `✅ [Socket] New client connected:` in logs |
| API returns 500 | Server logs | `❌ [HTTP]` or `Error:` in logs |

---

## Debugging Tips

### Enable More Verbose Logging
In `server-unified.js`, you can uncomment additional logging:
- HTTP response headers
- Socket.io handshake details
- Request body/query parameters

### Check Node.js Version
Render might use different Node.js version:
```bash
node --version
npm --version
```

### Free Tier Limitations
If using Render free tier:
- Services go to sleep after 15 min inactivity
- First request after sleep takes ~30 sec
- CPU/RAM limited
- If you hit limits, app will restart

---

## Success Indicators

✅ App is working correctly when you see:
1. ✅ Build completes with "Build completed successfully!"
2. ✅ Server starts with "🚀 EntreprenApp Unified Server Started"
3. ✅ You can visit `/dashboard` without 404
4. ✅ Refresh page (F5) - still shows content, no 404
5. ✅ Browser console shows socket connected
6. ✅ Render logs show `✅ [Socket] New client connected:` messages

❌ Something is wrong if you see:
1. ❌ Build process stops with errors
2. ❌ Server doesn't start (no listening message)
3. ❌ Any route shows 404 or Cannot GET
4. ❌ Browser console shows socket errors
5. ❌ No logs appearing for your requests
