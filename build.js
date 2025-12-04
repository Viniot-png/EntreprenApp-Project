#!/usr/bin/env node
/**
 * Build script for Render deployment
 * This script installs dependencies for both backend and frontend
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║     🏗️  EntreprenApp Build Script                     ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

try {
  // Build backend
  console.log('📦 Step 1: Installing backend dependencies...');
  process.chdir(path.join(__dirname, 'EntreprenApp-Backend'));
  execSync('npm install --production', { stdio: 'inherit' });
  console.log('✅ Backend dependencies installed\n');

  // Build frontend
  console.log('📦 Step 2: Installing frontend dependencies...');
  process.chdir(path.join(__dirname, 'entreprenapp-frontend'));
  execSync('npm install --production', { stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed\n');

  console.log('🔨 Step 3: Building frontend...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Frontend built\n');

  // Verify frontend build
  const distPath = path.join(__dirname, 'entreprenapp-frontend', 'dist');
  const indexHtmlPath = path.join(distPath, 'index.html');
  
  if (fs.existsSync(indexHtmlPath)) {
    console.log(`✅ Frontend build verified - index.html found at ${indexHtmlPath}\n`);
  } else {
    throw new Error(`Frontend build failed - index.html not found at ${indexHtmlPath}`);
  }

  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     ✅ Build completed successfully!                  ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  process.exit(0);
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}
