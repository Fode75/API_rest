import { z } from 'zod';

// Schémas de validation des corps de requête, partagés par les routers.

const email = z.string().trim().toLowerCase().email('E-mail invalide');

// Règle simple : 8 caractères minimum, au moins une lettre et un chiffre.
const password = z
  .string()
  .min(8, 'Au moins 8 caractères')
  .regex(/[A-Za-z]/, 'Au moins une lettre')
  .regex(/\d/, 'Au moins un chiffre');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Mot de passe requis'),
});

export const refreshSchema = z.object({ refreshToken: z.string().min(1) });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: password,
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(1),
  password,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: password,
});

export const inviteUserSchema = z.object({
  email,
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  role: z.enum(['ADMIN', 'AGENT', 'USER', 'SUPER_ADMIN']).default('USER'),
});

export const setStatusSchema = z.object({ isActive: z.boolean() });
