import { loginSchema, baseRegisterSchema, forgotPasswordSchema, resetPasswordSchema } from "../utils/validationSchemas.js";

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      });
    }
    return res.status(400).json({
      success: false,
      message: "Invalid input"
    });
  }
};

export const validateLogin = validate(loginSchema);
export const validateRegister = validate(baseRegisterSchema);
export const validateForgotPassword = validate(forgotPasswordSchema);
export const validateResetPassword = validate(resetPasswordSchema);

export default validate;