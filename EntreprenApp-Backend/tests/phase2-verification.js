import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🧪 PHASE 2 VERIFICATION TEST\n');

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

// Test 1: cloudinaryHelpers.js exists and exports
console.log('📋 Test 1: cloudinaryHelpers.js');
try {
  const cloudinaryHelpersPath = path.join(__dirname, '../utils/cloudinaryHelpers.js');
  const content = fs.readFileSync(cloudinaryHelpersPath, 'utf-8');
  
  test('cloudinaryHelpers.js exists', fs.existsSync(cloudinaryHelpersPath));
  test('Has initializeCloudinary export', content.includes('export const initializeCloudinary'));
  test('Has getCloudinaryInstance export', content.includes('export const getCloudinaryInstance'));
  test('Has getCloudinaryConfig export', content.includes('export const getCloudinaryConfig'));
  test('initializeCloudinary configures Cloudinary', content.includes('cloudinary.config'));
} catch (error) {
  console.log(`❌ Error reading cloudinaryHelpers.js: ${error.message}`);
  failedTests++;
}

// Test 2: apiResponse.js exists and exports
console.log('\n📋 Test 2: apiResponse.js');
try {
  const apiResponsePath = path.join(__dirname, '../utils/apiResponse.js');
  const content = fs.readFileSync(apiResponsePath, 'utf-8');
  
  test('apiResponse.js exists', fs.existsSync(apiResponsePath));
  test('Has ApiResponse class', content.includes('export class ApiResponse'));
  test('Has asyncHandler export', content.includes('export const asyncHandler'));
  test('Has sendSuccess export', content.includes('export const sendSuccess'));
  test('Has sendError export', content.includes('export const sendError'));
  test('Has ErrorCodes export', content.includes('export const ErrorCodes'));
  test('Has ApiError class', content.includes('export class ApiError'));
} catch (error) {
  console.log(`❌ Error reading apiResponse.js: ${error.message}`);
  failedTests += 7;
}

// Test 3: errorHandler.js exists and exports
console.log('\n📋 Test 3: errorHandler.js');
try {
  const errorHandlerPath = path.join(__dirname, '../middlewares/errorHandler.js');
  const content = fs.readFileSync(errorHandlerPath, 'utf-8');
  
  test('errorHandler.js exists', fs.existsSync(errorHandlerPath));
  test('Has errorHandler middleware export', content.includes('export const errorHandler'));
  test('Has notFoundHandler middleware export', content.includes('export const notFoundHandler'));
  test('errorHandler uses ApiResponse', content.includes('new ApiResponse'));
  test('errorHandler logs server errors', content.includes('console.error'));
} catch (error) {
  console.log(`❌ Error reading errorHandler.js: ${error.message}`);
  failedTests += 5;
}

// Test 4: checkResourceOwnership.js exists and exports
console.log('\n📋 Test 4: checkResourceOwnership.js');
try {
  const ownershipPath = path.join(__dirname, '../middlewares/checkResourceOwnership.js');
  const content = fs.readFileSync(ownershipPath, 'utf-8');
  
  test('checkResourceOwnership.js exists', fs.existsSync(ownershipPath));
  test('Has checkPostOwnership export', content.includes('export const checkPostOwnership'));
  test('Has checkEventOwnership export', content.includes('export const checkEventOwnership'));
  test('Has checkProfileOwnership export', content.includes('export const checkProfileOwnership'));
  test('Has checkDeletePermission export', content.includes('export const checkDeletePermission'));
  test('Uses asyncHandler wrapper', content.includes('asyncHandler'));
  test('Uses ApiError for errors', content.includes('ApiError'));
} catch (error) {
  console.log(`❌ Error reading checkResourceOwnership.js: ${error.message}`);
  failedTests += 7;
}

// Test 5: server.js integration
console.log('\n📋 Test 5: server.js integration');
try {
  const serverPath = path.join(__dirname, '../server.js');
  const content = fs.readFileSync(serverPath, 'utf-8');
  
  test('server.js imports cloudinaryHelpers', content.includes('initializeCloudinary'));
  test('server.js imports errorHandler', content.includes('errorHandler'));
  test('server.js calls initializeCloudinary', content.includes('initializeCloudinary()'));
  test('server.js uses errorHandler middleware', content.includes('app.use(errorHandler)'));
  test('server.js uses notFoundHandler', content.includes('app.use(notFoundHandler)'));
} catch (error) {
  console.log(`❌ Error reading server.js: ${error.message}`);
  failedTests += 5;
}

// Test 6: uploadMiddleware.js uses cloudinaryHelpers
console.log('\n📋 Test 6: uploadMiddleware.js');
try {
  const uploadPath = path.join(__dirname, '../utils/uploadMiddleware.js');
  const content = fs.readFileSync(uploadPath, 'utf-8');
  
  test('uploadMiddleware.js exists', fs.existsSync(uploadPath));
  test('Imports getCloudinaryInstance', content.includes('getCloudinaryInstance'));
  test('No cloudinary.config() in uploadMiddleware', !content.includes('cloudinary.config'));
  test('DEBUG logs removed from uploadMedia', !content.includes('[DEBUG UPLOAD]'));
  test('DEBUG logs removed from uploadEventImage', !content.includes('[DEBUG UPLOAD EVENT]'));
  test('Proper error logging without DEBUG', content.includes('console.error(\'Erreur upload'));
} catch (error) {
  console.log(`❌ Error reading uploadMiddleware.js: ${error.message}`);
  failedTests += 6;
}

// Test 7: event.controller.js DEBUG logs removed
console.log('\n📋 Test 7: event.controller.js');
try {
  const eventPath = path.join(__dirname, '../controllers/event.controller.js');
  const content = fs.readFileSync(eventPath, 'utf-8');
  
  test('event.controller.js exists', fs.existsSync(eventPath));
  test('[DEBUG EVENT CREATE] logs removed', !content.includes('[DEBUG EVENT CREATE]'));
  test('[DEBUG] Image updated logs removed', !content.includes('console.log(\'[DEBUG] Image updated\''));
  test('[DEBUG] Cloudinary logs removed', !content.includes('[DEBUG] Cloudinary event update'));
} catch (error) {
  console.log(`❌ Error reading event.controller.js: ${error.message}`);
  failedTests += 4;
}

// Test 8: No duplicate Cloudinary config in controllers
console.log('\n📋 Test 8: No Cloudinary config duplication');
try {
  const controllersPath = path.join(__dirname, '../controllers');
  const controllers = fs.readdirSync(controllersPath).filter(f => f.endsWith('.controller.js'));
  
  let duplicateConfigFound = false;
  controllers.forEach(controllerFile => {
    const filePath = path.join(controllersPath, controllerFile);
    const content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes('cloudinary.config')) {
      duplicateConfigFound = true;
      console.log(`❌ Found cloudinary.config in ${controllerFile}`);
    }
  });
  
  test('No cloudinary.config in any controller', !duplicateConfigFound);
} catch (error) {
  console.log(`❌ Error checking controllers: ${error.message}`);
  failedTests++;
}

// Test 9: Verify no remaining DEBUG logs in critical files
console.log('\n📋 Test 9: Verify no DEBUG logs');
try {
  const filesToCheck = [
    'controllers/post.controller.js',
    'controllers/auth.controller.js',
    'controllers/comment.controller.js',
    'utils/notificationService.js'
  ];
  
  let debugLogsFound = false;
  filesToCheck.forEach(file => {
    const filePath = path.join(__dirname, '../' + file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      // Check for [DEBUG] pattern specifically
      if (content.match(/console\.log\s*\(\s*['"`]\[DEBUG\]/)) {
        debugLogsFound = true;
        console.log(`⚠️  Found [DEBUG] logs in ${file}`);
      }
    }
  });
  
  test('No [DEBUG] console logs in critical files', !debugLogsFound);
} catch (error) {
  console.log(`❌ Error verifying DEBUG logs: ${error.message}`);
  failedTests++;
}

// Print summary
console.log('\n' + '='.repeat(50));
console.log(`✅ PASSED: ${passedTests}`);
console.log(`❌ FAILED: ${failedTests}`);
console.log('='.repeat(50));

if (failedTests === 0) {
  console.log('\n🎉 All Phase 2 tests passed!\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please review the output above.\n');
  process.exit(1);
}
