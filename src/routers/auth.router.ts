import { Router } from 'express';
import { authLimiter } from '../middlewares/rateLimiter';
import { login } from '../controllers/auth.controller';

const router = Router();

router.post('/login', authLimiter, login);

export default router;