import { Router } from 'express';
import { Role } from '../generated/prisma/client';
import * as users from '../controllers/userController';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { validate } from '../middlewares/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { inviteUserSchema, setStatusSchema } from '../utils/schemas';

const router = Router();

// Tout ce router est réservé aux admins connectés.
router.use(authenticate, authorize(Role.ADMIN, Role.SUPER_ADMIN));

router.get('/users', asyncHandler(users.list));
router.post('/users/invite', validate(inviteUserSchema), asyncHandler(users.invite));
router.patch('/users/:id/status', validate(setStatusSchema), asyncHandler(users.setStatus));

export default router;
