import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: string;
  };
}

// Vérification du Token JWT (Access Token)
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Accès refusé. Token manquant." });
  }

  const secret = process.env.JWT_SECRET || 'secret_par_defaut';

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token invalide ou expiré." });
    }
    req.user = user as { userId: number; role: string };
    next();
  });
};

// Vérification des rôles (ex: SUPER_ADMIN, ADMIN, AGENT, USER)
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Permissions insuffisantes pour accéder à cette ressource." });
    }
    next();
  };
};