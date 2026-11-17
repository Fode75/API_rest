import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

// Valide req.body avec un schéma Zod. Si c'est bon, req.body est remplacé
// par la version nettoyée (types corrects, champs inconnus retirés).
export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
