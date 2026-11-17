import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/auth';
import { listTickets, createTicket, updateTicket, deleteTicket } from '../controllers/ticket.controller';

const router = Router();

router.get('/', authenticateToken, listTickets);
router.post('/', authenticateToken, createTicket);
router.patch('/:id', authenticateToken, updateTicket);
router.delete('/:id', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN'), deleteTicket);

export default router;