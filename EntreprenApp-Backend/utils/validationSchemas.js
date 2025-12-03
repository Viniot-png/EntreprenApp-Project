import { z } from 'zod';

// common
const emailSchema = z.string().email('Email invalide');
const passwordSchema = z
  .string()
  .min(4, 'Le mot de passe doit contenir au moins 4 caractères')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir une lettre majuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir un chiffre')
  .regex(/[!@#$%^&*]/, 'Le mot de passe doit contenir un caractère spécial (!@#$%^&*)');

// Login
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// Register - fields expected by controllers (multipart/form-data fields)
export const baseRegisterSchema = z.object({
  username: z.string().min(3, 'Le username est requis'),
  fullname: z.string().min(3, 'Le nom complet est requis'),
  email: emailSchema,
  password: passwordSchema,
  role: z.string().nonempty('Role is required'),
  location: z.string().optional(), // Made optional as location can be provided later
  // optional fields depending on role
  gender: z.string().optional(),
  dob: z.string().optional(),
  sector: z.string().optional(),
  professionalEmail: z.string().email('Professional email invalide').optional(),
  foundedYear: z.union([z.string(), z.number()]).optional(),
  universityName: z.string().optional(),
  officialUniversityEmail: z.string().email('Official university email invalide').optional(),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// For reset controller we only validate password here; token comes from URL param
export const resetPasswordSchema = z.object({
  password: passwordSchema,
});

export default {
  loginSchema,
  baseRegisterSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};