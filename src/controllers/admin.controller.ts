import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { inviteUserSchema } from '../utils/validators';
import { createUserInvite } from '../services/admin.service';

export const inviteUser = async (req: AuthRequest, res: Response) => {
  const parsed = inviteUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Données d'invitation invalides.",
      details: parsed.error.flatten().fieldErrors
    });
  }

  try {
    const result = await createUserInvite(parsed.data);
    if (result.conflict) {
      return res.status(409).json({ error: "Un utilisateur avec cet email existe déjà." });
    }

    return res.status(201).json({ message: "Utilisateur créé avec succès.", user: result.user });
  } catch (error) {
    console.error('[INVITE ERROR] Erreur lors de la création de l’utilisateur.');
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};