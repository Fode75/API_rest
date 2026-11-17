import { Router } from 'express';
import { health } from '../controllers/healthController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(health));

export default router;
