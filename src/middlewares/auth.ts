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

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('[SECURITY ERROR] JWT_SECRET non défini dans les variables d’environnement.');
    return res.status(500).json({ error: "Erreur de configuration du serveur." });
  }

  try {
    const decoded = jwt.verify(token, secret) as { userId: number; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token invalide ou expiré." });
  }
};

// Contrôle d'accès basé sur les rôles (RBAC)
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Accès interdit. Permissions insuffisantes." });
    }
    next();
  };
};