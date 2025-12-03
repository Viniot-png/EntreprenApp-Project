#!/usr/bin/env node
/**
 * Test script to verify Phase 1 checklist
 * Checks for:
 * 1. mediaHelpers.js exists and exports correct functions
 * 2. validateEnv.js exists and exports correct function
 * 3. Socket.IO CORS configuration is correct
 * 4. DB connection has retry logic
 * 5. No duplicate Cloudinary configs in controllers
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_PATH = path.join(__dirname, '..');

let passedTests = 0;
let failedTests = 0;

function test(name, condition) {
  if (condition) {
    console.log(`✅ ${name}`);
    passedTests++;
  } else {
    console.log(`❌ ${name}`);
    failedTests++;
  }
}

console.log('🧪 PHASE 1 VERIFICATION TEST\n');

// Test 1: mediaHelpers.js
console.log('📋 Test 1: mediaHelpers.js');
try {
  const mediaHelpersPath = path.join(BASE_PATH, 'utils', 'mediaHelpers.js');
  const content = fs.readFileSync(mediaHelpersPath, 'utf-8');
  test('mediaHelpers.js exists', fs.existsSync(mediaHelpersPath));
  test('Has extractPublicId export', content.includes('export const extractPublicId'));
  test('Has deleteFromCloudinary export', content.includes('export const deleteFromCloudinary'));
  test('Has uploadToCloudinary export', content.includes('export const uploadToCloudinary'));
} catch (e) {
  test('mediaHelpers.js exists', false);
}

// Test 2: validateEnv.js
console.log('\n📋 Test 2: validateEnv.js');
try {
  const validateEnvPath = path.join(BASE_PATH, 'utils', 'validateEnv.js');
  const content = fs.readFileSync(validateEnvPath, 'utf-8');
  test('validateEnv.js exists', fs.existsSync(validateEnvPath));
  test('Has validateEnv export', content.includes('export const validateEnv'));
  test('Validates MONGO_URL', content.includes('MONGO_URL'));
  test('Validates JWT secrets', content.includes('JWT_ACCESS_SECRET'));
  test('Validates Cloudinary keys', content.includes('CLOUDINARY_CLOUD_NAME'));
} catch (e) {
  test('validateEnv.js exists', false);
}

// Test 3: server.js configuration
console.log('\n📋 Test 3: server.js Socket.IO CORS');
try {
  const serverPath = path.join(BASE_PATH, 'server.js');
  const content = fs.readFileSync(serverPath, 'utf-8');
  test('validateEnv imported in server.js', content.includes('import { validateEnv }'));
  test('validateEnv called in server.js', content.includes('validateEnv()'));
  test('Socket.IO uses FRONTEND_URL or localhost', content.includes('process.env.FRONTEND_URL'));
  test('Socket.IO credentials enabled', content.includes('credentials: true'));
} catch (e) {
  console.log(`Error: ${e.message}`);
}

// Test 4: Db.js retry logic
console.log('\n📋 Test 4: Db.js retry logic');
try {
  const dbPath = path.join(BASE_PATH, 'dbConfig', 'Db.js');
  const content = fs.readFileSync(dbPath, 'utf-8');
  test('Db.js exists', fs.existsSync(dbPath));
  test('Has retry logic', content.includes('while (retryCount'));
  test('Has exponential backoff', content.includes('Math.pow(2'));
  test('Has max retries', content.includes('maxRetries'));
  test('Process exits on failure', content.includes('process.exit(1)'));
} catch (e) {
  test('Db.js exists', false);
}

// Test 5: No duplicate Cloudinary configs in controllers
console.log('\n📋 Test 5: Cloudinary config centralization');
try {
  const controllersPath = path.join(BASE_PATH, 'controllers');
  const files = fs.readdirSync(controllersPath).filter(f => f.endsWith('.controller.js'));
  
  let duplicateCount = 0;
  files.forEach(file => {
    const content = fs.readFileSync(path.join(controllersPath, file), 'utf-8');
    if (content.includes('cloudinary.config(')) {
      duplicateCount++;
    }
  });
  
  test('No Cloudinary config in controllers', duplicateCount === 0);
} catch (e) {
  console.log(`Error: ${e.message}`);
}

// Test 6: No duplicate extractPublicId in controllers
console.log('\n📋 Test 6: extractPublicId centralization');
try {
  const controllersPath = path.join(BASE_PATH, 'controllers');
  const files = fs.readdirSync(controllersPath).filter(f => f.endsWith('.controller.js'));
  
  let duplicateCount = 0;
  files.forEach(file => {
    const content = fs.readFileSync(path.join(controllersPath, file), 'utf-8');
    if (content.includes('const extractPublicId = ')) {
      duplicateCount++;
    }
  });
  
  test('No extractPublicId definition in controllers', duplicateCount === 0);
} catch (e) {
  console.log(`Error: ${e.message}`);
}

// Test 7: extractPublicId imported from mediaHelpers
console.log('\n📋 Test 7: mediaHelpers imports');
try {
  const postPath = path.join(BASE_PATH, 'controllers', 'post.controller.js');
  const eventPath = path.join(BASE_PATH, 'controllers', 'event.controller.js');
  
  const postContent = fs.readFileSync(postPath, 'utf-8');
  const eventContent = fs.readFileSync(eventPath, 'utf-8');
  
  test('post.controller imports mediaHelpers', postContent.includes('from "../utils/mediaHelpers.js"'));
  test('event.controller imports mediaHelpers', eventContent.includes('from "../utils/mediaHelpers.js"'));
  test('post.controller imports extractPublicId', postContent.includes('extractPublicId'));
  test('post.controller imports deleteFromCloudinary', postContent.includes('deleteFromCloudinary'));
} catch (e) {
  console.log(`Error: ${e.message}`);
}

// Final summary
console.log('\n' + '='.repeat(50));
console.log(`✅ PASSED: ${passedTests}`);
console.log(`❌ FAILED: ${failedTests}`);
console.log('='.repeat(50));

if (failedTests > 0) {
  console.log('\n⚠️  Some tests failed. Please review the above output.');
  process.exit(1);
} else {
  console.log('\n🎉 All Phase 1 tests passed!');
  process.exit(0);
}
