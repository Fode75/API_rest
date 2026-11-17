import rateLimit from 'express-rate-limit';

// Limite les tentatives sur les routes sensibles (anti brute-force, anti spam d'e-mails).
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de tentatives, réessaie dans quelques minutes' },
});
