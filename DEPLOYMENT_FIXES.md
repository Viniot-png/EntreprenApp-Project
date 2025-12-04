# Deployment Fixes for Render

## Problem
The Render build process was failing with:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'express' 
imported from /opt/render/project/src/EntreprenApp-Backend/server.js
```

This happened because:
1. Render executes `npm run build` from the root
2. But npm was finding `EntreprenApp-Backend/package.json` instead of root `package.json`
3. Backend's old build script tried to run `server.js` before dependencies were installed
4. Build failed because `express` module wasn't available yet

## Solutions Implemented

### 1. Root `package.json` (Created)
- Provides explicit npm scripts for Render: `npm run build` and `npm start`
- These scripts call our Node.js scripts which have proper path resolution

### 2. Improved `build.js`
**Key Features:**
- Uses `while` loop to climb up directory tree until finding `EntreprenApp-Backend/package.json`
- Throws clear error if project root not found
- Installs backend dependencies first
- Then installs frontend dependencies
- Then builds frontend with Vite
- Verifies `index.html` exists in dist/ after build
- Better error messages with stack traces

**Build Process:**
```
npm run build (from Render)
  ↓
Executes root build.js
  ↓
1. Find project root (C:\...\ or /opt/render/project/src/)
  ↓
2. cd EntreprenApp-Backend && npm install
  ↓
3. cd ../entreprenapp-frontend && npm install
  ↓
4. npm run build (Vite builds to dist/)
  ↓
5. Verify dist/index.html exists
```

### 3. Improved `start.js`
**Key Features:**
- Same directory climbing logic as build.js
- Changes to project root before importing server
- Imports `server-unified.js` which auto-starts on load
- Better error handling and logging

### 4. Fixed `EntreprenApp-Backend/package.json`
Changed:
```json
"build": "node server.js"
```

To:
```json
"build": "echo 'Build handled by root build.js'"
```

This prevents the backend build script from interfering when npm searches for a build script.

### 5. `server-unified.js` (No Changes Needed)
- Automatically starts server on module load
- Exports default app
- Already has comprehensive logging
- Already handles SPA routing (all non-API routes → index.html)

## How It Works on Render

**Build Phase:**
```
$ npm run build
  Uses: root package.json script
  Executes: node build.js
  Steps:
    ✓ Find project root
    ✓ npm install (backend)
    ✓ npm install (frontend)  
    ✓ npm run build (frontend/Vite)
    ✓ Verify dist/index.html
```

**Start Phase:**
```
$ npm start
  Uses: root package.json script
  Executes: node start.js
  Steps:
    ✓ Find project root
    ✓ cd to project root
    ✓ import server-unified.js
    ✓ Server starts automatically on port 3000
    ✓ Express listens on /api/* routes
    ✓ React frontend serves from dist/
    ✓ SPA routing working (all non-/api routes → index.html)
```

## Path Resolution Logic

Both `build.js` and `start.js` use the same logic to find the project root:

```javascript
let __dirname = path.dirname(fileURLToPath(import.meta.url));

while (!fs.existsSync(path.join(__dirname, 'EntreprenApp-Backend', 'package.json'))) {
  const parent = path.dirname(__dirname);
  if (parent === __dirname) {
    throw new Error('Could not find project root');
  }
  __dirname = parent;
}
```

This works because:
- Local development: script is at root → finds root immediately
- Render (varies): script might be in nested dir → climbs up until finding `EntreprenApp-Backend/package.json`
- Same logic used in both files → consistent behavior

## Testing Before Deploying

To test locally (if you haven't already):

```bash
# From project root
npm run build          # Should see all 3 install steps + build + verify

npm start              # Should see unified server start on port 3000
                       # Visit http://localhost:3000
                       # Try: /dashboard, /events, /projects, etc.
                       # Refresh page (F5) - should work (no 404)
```

## Render Configuration

Your `render.yaml` should have (already configured):

```yaml
build: npm run build
start: npm start
```

Or Render settings can use:
- Build Command: `npm run build`
- Start Command: `npm start`

## What Changed Since Last Time

1. ✅ `build.js` - Improved with better error handling
2. ✅ `start.js` - Simplified (removed unnecessary function call)
3. ✅ Root `package.json` - Ensures npm scripts are found
4. ✅ `EntreprenApp-Backend/package.json` - Build script changed to no-op
5. ✅ `server-unified.js` - No changes needed (already correct)

## Expected Behavior After Deploy

1. Render triggers build: `npm run build`
2. See build logs: Installing dependencies, building Vite
3. Render starts app: `npm start`
4. See startup logs: "🚀 Starting EntreprenApp Server"
5. Server listens on port 3000
6. Access app at: `https://your-render-domain.com`
7. Navigate and refresh any page - no more 404 errors!
8. Check logs for Socket.io and API request logs
