// Erreur "attendue" : on choisit le code HTTP et le message affiché au client.
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const badRequest = (msg = 'Requête invalide') => new AppError(400, msg);
export const unauthorized = (msg = 'Non authentifié') => new AppError(401, msg);
export const forbidden = (msg = 'Accès refusé') => new AppError(403, msg);
export const notFound = (msg = 'Ressource introuvable') => new AppError(404, msg);
export const conflict = (msg = 'Conflit') => new AppError(409, msg);
