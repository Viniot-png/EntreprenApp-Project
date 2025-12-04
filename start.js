#!/usr/bin/env node
/**
 * Start script for Render deployment
 * This script starts the unified server
 */

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║     🚀 EntreprenApp Start Script                       ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

import('./server-unified.js').catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
