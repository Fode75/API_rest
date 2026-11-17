import { Role, TokenType } from '../generated/prisma/client';
import { prisma } from '../utils/prisma';
import { conflict, forbidden, notFound } from '../utils/AppError';
import { generateRandomToken, hashToken, hoursFromNow } from '../utils/tokens';
import { sendWelcomeInvitationEmail } from './emailService';

const INVITATION_HOURS = 48;

// Hiérarchie : qui a le droit de créer / gérer quel rôle.
// - SUPER_ADMIN : tous les rôles
// - ADMIN : seulement AGENT et USER
const MANAGEABLE_ROLES: Record<Role, Role[]> = {
  SUPER_ADMIN: [Role.SUPER_ADMIN, Role.ADMIN, Role.AGENT, Role.USER],
  ADMIN: [Role.AGENT, Role.USER],
  AGENT: [],
  USER: [],
};

const canManage = (actorRole: Role, targetRole: Role) =>
  MANAGEABLE_ROLES[actorRole].includes(targetRole);

interface Actor {
  id: string;
  role: Role;
}

export async function inviteUser(
  actor: Actor,
  input: { email: string; firstName: string; lastName: string; role: Role },
) {
  if (!canManage(actor.role, input.role)) {
    throw forbidden(`Tu n'as pas le droit d'inviter le rôle ${input.role}`);
  }

  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });

  // Un compte déjà activé ne peut pas être ré-invité.
  if (existing?.passwordHash) throw conflict('Un compte actif existe déjà avec cet e-mail');

  // Si l'invitation n'avait pas été acceptée, on met à jour la fiche et on renvoie un nouveau lien.
  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          role: input.role,
          isActive: true,
        },
      })
    : await prisma.user.create({
        data: {
          email,
          firstName: input.firstName,
          lastName: input.lastName,
          role: input.role,
          invitedById: actor.id,
        },
      });

  // On annule les anciennes invitations, puis on en crée une nouvelle.
  await prisma.token.updateMany({
    where: { userId: user.id, type: TokenType.INVITATION, usedAt: null },
    data: { usedAt: new Date() },
  });

  const rawToken = generateRandomToken();
  await prisma.token.create({
    data: {
      type: TokenType.INVITATION,
      tokenHash: hashToken(rawToken),
      userId: user.id,
      expiresAt: hoursFromNow(INVITATION_HOURS),
    },
  });

  const inviter = await prisma.user.findUnique({ where: { id: actor.id } });
  const inviterName = inviter ? `${inviter.firstName} ${inviter.lastName}` : 'Un administrateur';

  // Si Resend échoue, l'erreur 502 remonte : l'utilisateur existe, l'admin peut relancer l'invitation.
  await sendWelcomeInvitationEmail({
    to: user.email,
    firstName: user.firstName,
    inviterName,
    token: rawToken,
  });

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };
}

export async function listUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function setUserActive(actor: Actor, targetId: string, isActive: boolean) {
  if (actor.id === targetId) throw forbidden('Tu ne peux pas modifier ton propre statut');

  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) throw notFound('Utilisateur introuvable');
  if (!canManage(actor.role, target.role)) throw forbidden('Tu ne peux pas gérer ce compte');

  await prisma.user.update({ where: { id: targetId }, data: { isActive } });

  // Désactivation : on coupe aussitôt toutes ses sessions.
  if (!isActive) {
    await prisma.token.updateMany({
      where: { userId: targetId, type: TokenType.REFRESH, usedAt: null },
      data: { usedAt: new Date() },
    });
  }
}
