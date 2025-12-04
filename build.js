#!/usr/bin/env node
/**
 * Build script for Render deployment
 * This script installs dependencies for both backend and frontend
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Render clones into /opt/render/project/src by default
// So we need to find the root of the project
let projectRoot = __dirname;
console.log(`Current directory: ${projectRoot}`);

// If we're in a subdirectory, go up to find the root
while (!fs.existsSync(path.join(projectRoot, 'EntreprenApp-Backend')) && 
       !fs.existsSync(path.join(projectRoot, 'package.json')) && 
       projectRoot !== '/') {
  projectRoot = path.dirname(projectRoot);
}

console.log(`Project root: ${projectRoot}`);

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║     🏗️  EntreprenApp Build Script                     ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

try {
  // Build backend
  console.log('📦 Step 1: Installing backend dependencies...');
  const backendDir = path.join(projectRoot, 'EntreprenApp-Backend');
  console.log(`   Backend path: ${backendDir}`);
  
  if (!fs.existsSync(backendDir)) {
    throw new Error(`Backend directory not found at ${backendDir}`);
  }
  
  process.chdir(backendDir);
  execSync('npm install --production', { stdio: 'inherit' });
  console.log('✅ Backend dependencies installed\n');

  // Build frontend
  console.log('📦 Step 2: Installing frontend dependencies...');
  const frontendDir = path.join(projectRoot, 'entreprenapp-frontend');
  console.log(`   Frontend path: ${frontendDir}`);
  
  if (!fs.existsSync(frontendDir)) {
    throw new Error(`Frontend directory not found at ${frontendDir}`);
  }
  
  process.chdir(frontendDir);
  execSync('npm install --production', { stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed\n');

  console.log('🔨 Step 3: Building frontend...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Frontend built\n');

  // Verify frontend build
  const distPath = path.join(frontendDir, 'dist');
  const indexHtmlPath = path.join(distPath, 'index.html');
  
  console.log(`Checking for index.html at: ${indexHtmlPath}`);
  if (fs.existsSync(indexHtmlPath)) {
    const stats = fs.statSync(indexHtmlPath);
    console.log(`✅ Frontend build verified - index.html found (${stats.size} bytes)\n`);
  } else {
    throw new Error(`Frontend build failed - index.html not found at ${indexHtmlPath}`);
  }

  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     ✅ Build completed successfully!                  ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  process.exit(0);
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
