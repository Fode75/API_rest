import { NextFunction, Request, Response } from 'express';
import { Role } from '../generated/prisma/client';
import { unauthorized } from '../utils/AppError';
import { verifyAccessToken } from '../utils/tokens';

// On ajoute `req.user` au type Request d'Express.
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: Role };
    }
  }
}

// Vérifie l'en-tête "Authorization: Bearer <accessToken>".
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next(unauthorized('Token manquant'));

  try {
    const payload = verifyAccessToken(header.slice(7));
    req.user = { id: payload.sub, role: payload.role as Role };
    next();
  } catch {
    next(unauthorized('Token invalide ou expiré'));
  }
}
