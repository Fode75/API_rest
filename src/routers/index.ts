import { Router } from 'express';
import adminRouter from './adminRouter';
import authRouter from './authRouter';

// Regroupe les routers sous /api. (/health est monté directement dans app.ts.)
const router = Router();

router.use('/auth', authRouter);
router.use('/admin', adminRouter);

export default router;
