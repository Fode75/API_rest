import { NextFunction, Request, Response } from 'express';
import { Role } from '../generated/prisma/client';
import { forbidden, unauthorized } from '../utils/AppError';

// À placer APRÈS authenticate : authorize(Role.ADMIN, Role.SUPER_ADMIN)
export const authorize =
  (...allowedRoles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(unauthorized());
    if (!allowedRoles.includes(req.user.role)) return next(forbidden());
    next();
  };
