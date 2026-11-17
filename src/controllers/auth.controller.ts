import { Request, Response } from 'express';
import { loginSchema } from '../utils/validators';
import { authenticateUser } from '../services/auth.service';

export const login = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Données d'entrée invalides.",
      details: parsed.error.flatten().fieldErrors
    });
  }

  try {
    const result = await authenticateUser(parsed.data.email, parsed.data.password);
    if (!result) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    return res.status(200).json({
      message: "Connexion réussie.",
      ...result
    });
  } catch (error: any) {
    if (error.message === 'JWT_SECRET_MISSING') {
      console.error('[AUTH ERROR] JWT_SECRET manquant.');
      return res.status(500).json({ error: "Erreur de configuration du serveur." });
    }
    console.error('[LOGIN ERROR]', error);
    return res.status(500).json({ error: "Erreur interne du serveur lors de la connexion." });
  }
};