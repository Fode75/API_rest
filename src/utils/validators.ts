import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email("Format d'email invalide."),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères.").max(100)
});

export const createTicketSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères.").max(150, "Le titre est trop long."),
  description: z.string().min(5, "La description doit contenir au moins 5 caractères.").max(2000),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional()
});

export const updateTicketSchema = z.object({
  title: z.string().min(3).max(150).optional(),
  description: z.string().min(5).max(2000).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional()
});

export const inviteUserSchema = z.object({
  email: z.string().email("Format d'email invalide."),
  name: z.string().min(2).max(100),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères.").max(100),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'AGENT', 'USER']).optional()
});