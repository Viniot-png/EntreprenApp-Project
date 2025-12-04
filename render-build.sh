#!/bin/bash
# Render Build Command - Install all dependencies

echo "📦 Installing backend dependencies..."
cd EntreprenApp-Backend
npm install
cd ..

echo "📦 Installing frontend dependencies..."
cd entreprenapp-frontend
npm install
npm run build
cd ..

echo "✅ All dependencies installed and frontend built"
