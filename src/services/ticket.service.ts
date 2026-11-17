import { prisma } from '../utils/prisma';

export const getPaginatedTickets = async (userId: number, role: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const whereClause = role === 'USER' ? { authorId: userId } : {};

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, email: true } }
      }
    }),
    prisma.ticket.count({ where: whereClause })
  ]);

  return {
    data: tickets,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const createNewTicket = async (authorId: number, data: { title: string; description: string; status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' }) => {
  return prisma.ticket.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status || 'OPEN',
      authorId
    }
  });
};

export const findTicketById = async (ticketId: number) => {
  return prisma.ticket.findUnique({ where: { id: ticketId } });
};

export const updateExistingTicket = async (ticketId: number, data: { title?: string; description?: string; status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' }) => {
  return prisma.ticket.update({
    where: { id: ticketId },
    data
  });
};

export const removeTicket = async (ticketId: number) => {
  return prisma.ticket.delete({ where: { id: ticketId } });
};