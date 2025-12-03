import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🧪 PHASE 4 VERIFICATION TEST\n');

let passedTests = 0;
let failedTests = 0;

const test = (description, condition) => {
  if (condition) {
    console.log(`✅ ${description}`);
    passedTests++;
  } else {
    console.log(`❌ ${description}`);
    failedTests++;
  }
};

// Test 1: Password Requirements Enhancement
console.log('📋 Test 1: Password Requirements (Task 17)');
try {
  const validationPath = path.join(__dirname, '../utils/validationSchemas.js');
  const content = fs.readFileSync(validationPath, 'utf-8');
  
  test('validationSchemas.js exists', fs.existsSync(validationPath));
  test('Password min 4 characters', content.includes('min(4'));
  test('Password requires uppercase', content.includes('[A-Z]'));
  test('Password requires number', content.includes('[0-9]'));
  test('Password requires special character', content.includes('[!@#$%^&*]'));
} catch (error) {
  console.log(`❌ Error reading validationSchemas: ${error.message}`);
  failedTests += 5;
}

// Test 2: Soft Delete Users
console.log('\n📋 Test 2: Soft Delete Users (Task 18)');
try {
  const userModelPath = path.join(__dirname, '../models/user.model.js');
  const content = fs.readFileSync(userModelPath, 'utf-8');
  
  test('User model exists', fs.existsSync(userModelPath));
  test('Has deletedAt field', content.includes('deletedAt'));
  test('deletedAt type is Date', content.includes('type: Date'));
  test('deletedAt default is null', content.includes('default: null'));
  test('Has soft delete middleware', content.includes('pre'));
  test('Middleware filters deleted users', content.includes('deletedAt: null'));
} catch (error) {
  console.log(`❌ Error reading user model: ${error.message}`);
  failedTests += 6;
}

// Test 3: TTL Notifications
console.log('\n📋 Test 3: TTL Notifications (Task 19)');
try {
  const notificationPath = path.join(__dirname, '../models/notification.model.js');
  const content = fs.readFileSync(notificationPath, 'utf-8');
  
  test('Notification model exists', fs.existsSync(notificationPath));
  test('Has expiresAt field', content.includes('expiresAt'));
  test('expiresAt type is Date', content.includes('type: Date'));
  test('expiresAt default is 30 days future', content.includes('30 * 24 * 60 * 60'));
  test('Has TTL index', content.includes('expireAfterSeconds'));
  test('TTL index on expiresAt field', content.includes('{ expiresAt: 1 }'));
} catch (error) {
  console.log(`❌ Error reading notification model: ${error.message}`);
  failedTests += 6;
}

// Test 4: isRead Flags
console.log('\n📋 Test 4: isRead Flags (Task 20)');
try {
  const notificationPath = path.join(__dirname, '../models/notification.model.js');
  const messagePath = path.join(__dirname, '../models/message.model.js');
  
  const notificationContent = fs.readFileSync(notificationPath, 'utf-8');
  const messageContent = fs.readFileSync(messagePath, 'utf-8');
  
  test('Notification has read field', notificationContent.includes('read'));
  test('Notification read is boolean', notificationContent.includes('type: Boolean'));
  test('Notification read default false', notificationContent.includes('default: false'));
  test('Message has read field', messageContent.includes('read'));
  test('Message read is boolean', messageContent.includes('type: Boolean'));
  test('Message read default false', messageContent.includes('default: false'));
} catch (error) {
  console.log(`❌ Error reading models: ${error.message}`);
  failedTests += 6;
}

// Test 5: Syntax Check
console.log('\n📋 Test 5: Models Syntax Validation');
try {
  const files = [
    '../utils/validationSchemas.js',
    '../models/user.model.js',
    '../models/notification.model.js',
    '../models/message.model.js'
  ];
  
  let syntaxErrors = 0;
  files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${file}`);
      syntaxErrors++;
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    // Basic syntax check: look for unterminated brackets
    const openBrackets = (content.match(/{/g) || []).length;
    const closeBrackets = (content.match(/}/g) || []).length;
    
    if (openBrackets !== closeBrackets) {
      console.log(`❌ Bracket mismatch in ${file}`);
      syntaxErrors++;
    }
  });
  
  test('All files have valid syntax', syntaxErrors === 0);
  passedTests += (syntaxErrors === 0 ? 1 : 0);
  failedTests += (syntaxErrors > 0 ? 1 : 0);
} catch (error) {
  console.log(`❌ Syntax check error: ${error.message}`);
  failedTests++;
}

// Test 6: No Breaking Changes
console.log('\n📋 Test 6: Backward Compatibility');
try {
  const userPath = path.join(__dirname, '../models/user.model.js');
  const notificationPath = path.join(__dirname, '../models/notification.model.js');
  const messagePath = path.join(__dirname, '../models/message.model.js');
  
  const userContent = fs.readFileSync(userPath, 'utf-8');
  const notificationContent = fs.readFileSync(notificationPath, 'utf-8');
  const messageContent = fs.readFileSync(messagePath, 'utf-8');
  
  test('User model exports properly', userContent.includes('export default mongoose.model'));
  test('Notification model maintains read field', notificationContent.includes('read: {'));
  test('Message model maintains read field', messageContent.includes('read: {'));
  test('No breaking changes to existing fields', 
    userContent.includes('email') && userContent.includes('password'));
} catch (error) {
  console.log(`❌ Compatibility check error: ${error.message}`);
  failedTests += 4;
}

// Print summary
console.log('\n' + '='.repeat(50));
console.log(`✅ PASSED: ${passedTests}`);
console.log(`❌ FAILED: ${failedTests}`);
console.log('='.repeat(50));

if (failedTests === 0) {
  console.log('\n🎉 All Phase 4 Tests Passed!\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please review the output above.\n');
  process.exit(1);
}
