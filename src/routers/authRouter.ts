import { Router } from 'express';
import * as auth from '../controllers/authController';
import { authenticate } from '../middlewares/authenticate';
import { authLimiter } from '../middlewares/rateLimiters';
import { validate } from '../middlewares/validate';
import { asyncHandler } from '../utils/asyncHandler';
import {
  acceptInvitationSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  resetPasswordSchema,
} from '../utils/schemas';

const router = Router();

// Routes publiques (limitées en nombre de tentatives)
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(auth.login));
router.post('/refresh', authLimiter, validate(refreshSchema), asyncHandler(auth.refresh));
router.post('/logout', validate(refreshSchema), asyncHandler(auth.logout));
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), asyncHandler(auth.forgotPassword));
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), asyncHandler(auth.resetPassword));
router.post('/accept-invitation', authLimiter, validate(acceptInvitationSchema), asyncHandler(auth.acceptInvitation));

// Routes protégées (token d'accès obligatoire)
router.get('/me', authenticate, asyncHandler(auth.me));
router.post('/change-password', authenticate, validate(changePasswordSchema), asyncHandler(auth.changePassword));

export default router;
