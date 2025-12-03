// ⚠️ DEPRECATED - Use validation.middleware.js instead
// This file is kept for backwards compatibility only
// All validation functions have been moved to middlewares/validation.middleware.js

export { 
  validateLogin, 
  validateRegister, 
  validateForgotPassword, 
  validateResetPassword 
} from './validation.middleware.js';
  }
};