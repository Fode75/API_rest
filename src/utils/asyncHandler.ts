import { NextFunction, Request, RequestHandler, Response } from 'express';

// Express 4 n'attrape pas les erreurs des fonctions async.
// Ce wrapper les envoie au middleware d'erreur via next(err).
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };
