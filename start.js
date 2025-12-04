#!/usr/bin/env node
/**
 * Start script for Render deployment
 * This script starts the unified server
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find project root (same logic as build.js)
let projectRoot = __dirname;
console.log(`Current directory: ${projectRoot}`);

while (!fs.existsSync(path.join(projectRoot, 'EntreprenApp-Backend')) && 
       !fs.existsSync(path.join(projectRoot, 'package.json')) && 
       projectRoot !== '/') {
  projectRoot = path.dirname(projectRoot);
}

console.log(`Project root: ${projectRoot}`);

// Change to project root to ensure paths are correct
process.chdir(projectRoot);

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║     🚀 EntreprenApp Start Script                       ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// Import and start the unified server
import('./server-unified.js').catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
