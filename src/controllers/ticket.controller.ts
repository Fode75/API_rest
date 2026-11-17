import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { createTicketSchema, updateTicketSchema } from '../utils/validators';
import {
  getPaginatedTickets,
  createNewTicket,
  findTicketById,
  updateExistingTicket,
  removeTicket
} from '../services/ticket.service';

export const listTickets = async (req: AuthRequest, res: Response) => {
  // VULN-004 : Pagination bornée à 50 résultats maximum
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const rawLimit = parseInt(req.query.limit as string, 10) || 10;
  const limit = Math.min(Math.max(1, rawLimit), 50);

  try {
    const result = await getPaginatedTickets(req.user!.userId, req.user!.role, page, limit);
    return res.status(200).json(result);
  } catch (error) {
    console.error('[GET TICKETS ERROR] Erreur lors de la récupération des tickets.');
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

export const createTicket = async (req: AuthRequest, res: Response) => {
  const parsed = createTicketSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Données du ticket invalides.",
      details: parsed.error.flatten().fieldErrors
    });
  }

  try {
    const ticket = await createNewTicket(req.user!.userId, parsed.data);
    return res.status(201).json(ticket);
  } catch (error) {
    console.error('[CREATE TICKET ERROR] Erreur lors de la création du ticket.');
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

export const updateTicket = async (req: AuthRequest, res: Response) => {
  const ticketId = parseInt(req.params.id, 10);
  if (isNaN(ticketId) || ticketId <= 0) {
    return res.status(400).json({ error: "ID de ticket invalide." });
  }

  const parsed = updateTicketSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Données de mise à jour invalides.",
      details: parsed.error.flatten().fieldErrors
    });
  }

  try {
    const existingTicket = await findTicketById(ticketId);
    if (!existingTicket) {
      return res.status(404).json({ error: "Ticket introuvable." });
    }

    if (req.user?.role === 'USER' && existingTicket.authorId !== req.user.userId) {
      return res.status(403).json({ error: "Accès interdit à ce ticket." });
    }

    const updatedTicket = await updateExistingTicket(ticketId, parsed.data);
    return res.status(200).json(updatedTicket);
  } catch (error) {
    console.error('[UPDATE TICKET ERROR] Erreur lors de la mise à jour du ticket.');
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

export const deleteTicket = async (req: AuthRequest, res: Response) => {
  const ticketId = parseInt(req.params.id, 10);
  if (isNaN(ticketId) || ticketId <= 0) {
    return res.status(400).json({ error: "ID de ticket invalide." });
  }

  try {
    const existingTicket = await findTicketById(ticketId);
    if (!existingTicket) {
      return res.status(404).json({ error: "Ticket introuvable." });
    }

    await removeTicket(ticketId);
    return res.status(200).json({ message: "Ticket supprimé avec succès." });
  } catch (error) {
    console.error('[DELETE TICKET ERROR] Erreur lors de la suppression du ticket.');
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};