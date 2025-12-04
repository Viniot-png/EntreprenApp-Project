#!/bin/bash
# Script to fix Render deployment for SPA routing

echo "🔧 Fixing Render configuration for SPA routing..."

# Le fichier render.yaml a été créé
# Maintenant on crée un script de déploiement pour Render

# Créer un procfile pour Render (alternative à render.yaml)
cat > Procfile << 'EOF'
web: npm run start --prefix EntreprenApp-Backend
EOF

echo "✅ Procfile créé"

# Créer un script de déploiement
cat > render-build.sh << 'EOF'
#!/bin/bash
set -e

echo "📦 Building backend..."
cd EntreprenApp-Backend
npm install
cd ..

echo "📦 Building frontend..."
cd entreprenapp-frontend
npm install
npm run build
cd ..

echo "✅ Build complete!"
EOF

chmod +x render-build.sh

echo "✅ Scripts créés. Utilisez render-build.sh pour le build."
