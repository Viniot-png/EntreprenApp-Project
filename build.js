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
let __dirname = path.dirname(__filename);

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║     🏗️  EntreprenApp Build Script                     ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// Find project root
console.log(`Initial directory: ${__dirname}`);

// Check if build.js is in the root directory
while (!fs.existsSync(path.join(__dirname, 'EntreprenApp-Backend', 'package.json'))) {
  const parent = path.dirname(__dirname);
  if (parent === __dirname) {
    throw new Error('Could not find project root - EntreprenApp-Backend/package.json not found');
  }
  __dirname = parent;
}

console.log(`Project root: ${__dirname}\n`);

try {
  // Build backend
  console.log('📦 Step 1: Installing backend dependencies...');
  const backendDir = path.join(__dirname, 'EntreprenApp-Backend');
  console.log(`   Path: ${backendDir}`);
  
  if (!fs.existsSync(backendDir)) {
    throw new Error(`Backend directory not found at ${backendDir}`);
  }
  
  process.chdir(backendDir);
  console.log(`   Changed to: ${process.cwd()}`);
  execSync('npm install --production', { stdio: 'inherit' });
  console.log('✅ Backend dependencies installed\n');

  // Build frontend
  console.log('📦 Step 2: Installing frontend dependencies...');
  const frontendDir = path.join(__dirname, 'entreprenapp-frontend');
  console.log(`   Path: ${frontendDir}`);
  
  if (!fs.existsSync(frontendDir)) {
    throw new Error(`Frontend directory not found at ${frontendDir}`);
  }
  
  process.chdir(frontendDir);
  console.log(`   Changed to: ${process.cwd()}`);
  execSync('npm install --production', { stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed\n');

  console.log('🔨 Step 3: Building frontend...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Frontend built\n');

  // Verify frontend build
  const distPath = path.join(frontendDir, 'dist');
  const indexHtmlPath = path.join(distPath, 'index.html');
  
  console.log(`Verifying build: ${indexHtmlPath}`);
  if (fs.existsSync(indexHtmlPath)) {
    const stats = fs.statSync(indexHtmlPath);
    console.log(`✅ index.html found (${stats.size} bytes)\n`);
  } else {
    throw new Error(`Frontend build failed - index.html not found at ${indexHtmlPath}`);
  }

  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     ✅ Build completed successfully!                  ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  process.exit(0);
} catch (error) {
  console.error('\n❌ Build failed:');
  console.error(`   Error: ${error.message}`);
  console.error(`   Stack: ${error.stack}`);
  process.exit(1);
}
