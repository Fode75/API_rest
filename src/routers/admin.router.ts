import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/auth';
import { inviteUser } from '../controllers/admin.controller';

const router = Router();

router.post('/invite', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN'), inviteUser);

export default router;