import { Request, Response } from 'express';
import * as userService from '../services/userService';
import { unauthorized } from '../utils/AppError';

export async function invite(req: Request, res: Response) {
  if (!req.user) throw unauthorized();
  const user = await userService.inviteUser(req.user, req.body);
  res.status(201).json({ message: 'Invitation envoyée', user });
}

export async function list(_req: Request, res: Response) {
  res.json(await userService.listUsers());
}

export async function setStatus(req: Request, res: Response) {
  if (!req.user) throw unauthorized();
  await userService.setUserActive(req.user, req.params.id, req.body.isActive);
  res.json({ message: req.body.isActive ? 'Compte réactivé' : 'Compte désactivé' });
}
