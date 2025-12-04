#!/bin/bash
# Complete build script for Render deployment

set -e

echo "═══════════════════════════════════════════════════════════"
echo "  EntreprenApp Production Build"
echo "═══════════════════════════════════════════════════════════"

# Build Backend
echo ""
echo "📦 Building Backend..."
cd EntreprenApp-Backend
npm install --production
cd ..
echo "✅ Backend built"

# Build Frontend
echo ""
echo "📦 Building Frontend..."
cd entreprenapp-frontend
npm install --production
npm run build
cd ..
echo "✅ Frontend built"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  ✅ Build complete! Ready for deployment."
echo "═══════════════════════════════════════════════════════════"
