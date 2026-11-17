import { Request, Response } from 'express';
import * as authService from '../services/authService';
import { unauthorized } from '../utils/AppError';

// Les controllers font peu de choses : lire la requête, appeler un service, répondre.
// La logique métier reste dans services/.

export async function login(req: Request, res: Response) {
  const result = await authService.login(req.body.email, req.body.password);
  res.json(result);
}

export async function refresh(req: Request, res: Response) {
  const tokens = await authService.refresh(req.body.refreshToken);
  res.json(tokens);
}

export async function logout(req: Request, res: Response) {
  await authService.logout(req.body.refreshToken);
  res.status(204).send();
}

export async function me(req: Request, res: Response) {
  if (!req.user) throw unauthorized();
  res.json(await authService.getMe(req.user.id));
}

export async function forgotPassword(req: Request, res: Response) {
  await authService.forgotPassword(req.body.email);
  // Toujours la même réponse, que l'e-mail existe ou non.
  res.json({ message: 'Si un compte existe avec cet e-mail, un lien de réinitialisation a été envoyé.' });
}

export async function resetPassword(req: Request, res: Response) {
  await authService.resetPassword(req.body.token, req.body.newPassword);
  res.json({ message: 'Mot de passe mis à jour. Tu peux te reconnecter.' });
}

export async function acceptInvitation(req: Request, res: Response) {
  await authService.acceptInvitation(req.body.token, req.body.password);
  res.json({ message: 'Compte activé. Tu peux te connecter.' });
}

export async function changePassword(req: Request, res: Response) {
  if (!req.user) throw unauthorized();
  await authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
  res.json({ message: 'Mot de passe modifié. Reconnecte-toi.' });
}
