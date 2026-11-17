import bcrypt from 'bcryptjs';
import { TokenType } from '../generated/prisma/client';
import { env } from '../utils/env';
import { prisma } from '../utils/prisma';
import { badRequest, notFound, unauthorized } from '../utils/AppError';
import {
  daysFromNow,
  generateRandomToken,
  hashToken,
  hoursFromNow,
  signAccessToken,
} from '../utils/tokens';
import { sendPasswordResetEmail } from './emailService';

const BCRYPT_ROUNDS = 12;
const RESET_TOKEN_HOURS = 1;

// Ce qu'on renvoie au client : jamais le hash du mot de passe.
function publicUser(user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}) {
  const { id, email, firstName, lastName, role } = user;
  return { id, email, firstName, lastName, role };
}

// Crée un access token (JWT court) + un refresh token (aléatoire, stocké hashé).
async function issueTokens(user: { id: string; role: string }) {
  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = generateRandomToken();

  await prisma.token.create({
    data: {
      type: TokenType.REFRESH,
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: daysFromNow(env.JWT_REFRESH_EXPIRES_DAYS),
    },
  });

  return { accessToken, refreshToken };
}

// Retourne un jeton valide (bon type, non utilisé, non expiré) ou null.
async function findValidToken(rawToken: string, type: TokenType) {
  const token = await prisma.token.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    include: { user: true },
  });
  if (!token || token.type !== type || token.usedAt || token.expiresAt < new Date()) return null;
  return token;
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  // Même message dans tous les cas d'échec : on ne révèle pas si l'e-mail existe.
  if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    throw unauthorized('E-mail ou mot de passe incorrect');
  }
  if (!user.isActive) throw unauthorized('Ce compte est désactivé');

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  const tokens = await issueTokens(user);
  return { user: publicUser(user), ...tokens };
}

// Rotation : chaque refresh token ne sert qu'une fois, on en renvoie un nouveau.
export async function refresh(rawRefreshToken: string) {
  const stored = await prisma.token.findUnique({
    where: { tokenHash: hashToken(rawRefreshToken) },
    include: { user: true },
  });

  if (!stored || stored.type !== TokenType.REFRESH) throw unauthorized('Refresh token invalide');

  // Un token déjà utilisé qu'on rejoue = possible vol : on coupe toutes les sessions.
  if (stored.usedAt) {
    await prisma.token.updateMany({
      where: { userId: stored.userId, type: TokenType.REFRESH, usedAt: null },
      data: { usedAt: new Date() },
    });
    throw unauthorized('Refresh token invalide');
  }
  if (stored.expiresAt < new Date()) throw unauthorized('Session expirée');
  if (!stored.user.isActive) throw unauthorized('Ce compte est désactivé');

  await prisma.token.update({ where: { id: stored.id }, data: { usedAt: new Date() } });
  return issueTokens(stored.user);
}

export async function logout(rawRefreshToken: string) {
  await prisma.token.updateMany({
    where: { tokenHash: hashToken(rawRefreshToken), type: TokenType.REFRESH, usedAt: null },
    data: { usedAt: new Date() },
  });
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw notFound('Utilisateur introuvable');
  return publicUser(user);
}

// Réponse identique que l'e-mail existe ou non (côté controller) : pas de fuite d'information.
export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  // Pas de reset pour un compte inexistant, désactivé, ou dont l'invitation n'est pas acceptée.
  if (!user || !user.isActive || !user.passwordHash) return;

  // On invalide les anciens liens de reset encore actifs.
  await prisma.token.updateMany({
    where: { userId: user.id, type: TokenType.PASSWORD_RESET, usedAt: null },
    data: { usedAt: new Date() },
  });

  const rawToken = generateRandomToken();
  await prisma.token.create({
    data: {
      type: TokenType.PASSWORD_RESET,
      tokenHash: hashToken(rawToken),
      userId: user.id,
      expiresAt: hoursFromNow(RESET_TOKEN_HOURS),
    },
  });

  await sendPasswordResetEmail({ to: user.email, firstName: user.firstName, token: rawToken });
}

export async function resetPassword(rawToken: string, newPassword: string) {
  const token = await findValidToken(rawToken, TokenType.PASSWORD_RESET);
  if (!token) throw badRequest('Lien invalide ou expiré');

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  // Transaction : tout réussit ou rien ne change.
  await prisma.$transaction([
    prisma.user.update({ where: { id: token.userId }, data: { passwordHash } }),
    prisma.token.update({ where: { id: token.id }, data: { usedAt: new Date() } }),
    // On déconnecte toutes les sessions existantes.
    prisma.token.updateMany({
      where: { userId: token.userId, type: TokenType.REFRESH, usedAt: null },
      data: { usedAt: new Date() },
    }),
  ]);
}

// L'utilisateur invité choisit son mot de passe grâce au lien reçu par e-mail.
export async function acceptInvitation(rawToken: string, password: string) {
  const token = await findValidToken(rawToken, TokenType.INVITATION);
  if (!token) throw badRequest('Invitation invalide ou expirée');
  if (!token.user.isActive) throw badRequest('Ce compte est désactivé');

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({ where: { id: token.userId }, data: { passwordHash } }),
    prisma.token.update({ where: { id: token.id }, data: { usedAt: new Date() } }),
  ]);
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.passwordHash) throw unauthorized();

  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw badRequest('Mot de passe actuel incorrect');
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    prisma.token.updateMany({
      where: { userId, type: TokenType.REFRESH, usedAt: null },
      data: { usedAt: new Date() },
    }),
  ]);
}
