#!/usr/bin/env node
/**
 * Start script for Render deployment
 * This script finds the project root and starts the unified server
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
let __dirname = path.dirname(__filename);

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║     🚀 Starting EntreprenApp Server                   ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// Find project root
console.log(`Initial directory: ${__dirname}`);

// Check if we're in the right directory
while (!fs.existsSync(path.join(__dirname, 'EntreprenApp-Backend', 'package.json'))) {
  const parent = path.dirname(__dirname);
  if (parent === __dirname) {
    throw new Error('Could not find project root - EntreprenApp-Backend/package.json not found');
  }
  __dirname = parent;
}

console.log(`Project root: ${__dirname}\n`);

try {
  // Change to project root
  process.chdir(__dirname);
  console.log(`Working directory: ${process.cwd()}\n`);

  // Install root dependencies if needed (for server-unified.js)
  const rootNodeModules = path.join(__dirname, 'node_modules');
  if (!fs.existsSync(rootNodeModules)) {
    console.log('📦 Installing root dependencies...');
    execSync('npm install', { stdio: 'inherit', cwd: __dirname });
    console.log('✅ Root dependencies installed\n');
  }

  // Verify server-unified.js exists
  const serverPath = path.join(__dirname, 'server-unified.js');
  if (!fs.existsSync(serverPath)) {
    throw new Error(`server-unified.js not found at ${serverPath}`);
  }
  console.log(`Loading server from: ${serverPath}\n`);

  // Import the server module (which automatically starts on load)
  await import(serverPath);

} catch (error) {
  console.error('\n❌ Failed to start server:');
  console.error(`   Error: ${error.message}`);
  console.error(`   Stack: ${error.stack}`);
  process.exit(1);
}
