# Configuration for Render.com deployment

## Frontend (entrepreneurapp-web)
- **Build Command:** `cd entreprenapp-frontend && npm install && npm run build`
- **Start Command:** `cd entreprenapp-frontend && npm run start`
- **Publish Directory:** `entreprenapp-frontend/dist`
- **Environment:** Node.js
- **Plan:** Standard

## Backend (entreprenapp-backend)
- **Build Command:** `cd EntreprenApp-Backend && npm install`
- **Start Command:** `cd EntreprenApp-Backend && node server.js`
- **Environment:** Node.js
- **Plan:** Standard

## Environment Variables (Set in Render Dashboard)
```
NODE_ENV=production
MONGO_URL=<your-mongodb-url>
JWT_ACCESS_SECRET=<your-secret>
JWT_REFRESH_SECRET=<your-secret>
SENDGRID_API_KEY=<your-key>
FRONTEND_URL=https://entreprenapp-web.onrender.com
VITE_API_BASE_URL=https://entreprenapp-backend-byvn.onrender.com
VITE_SOCKET_URL=https://entreprenapp-backend-byvn.onrender.com
```
