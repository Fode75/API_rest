import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import { env } from '../utils/env';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ message: `Route introuvable : ${req.method} ${req.originalUrl}` });
}

// Dernier middleware : toutes les erreurs passent ici.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  console.error(err);
  res.status(500).json({
    message: 'Erreur interne du serveur',
    ...(env.NODE_ENV === 'development' && { detail: String(err) }),
  });
}
