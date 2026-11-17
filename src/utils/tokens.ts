import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from './env';

export interface AccessPayload {
  sub: string; // id de l'utilisateur
  role: string;
}

// Jeton aléatoire envoyé par e-mail (invitation, reset) ou utilisé comme refresh.
export function generateRandomToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// En base on ne garde que le hash : si la base fuit, les jetons restent inutilisables.
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function signAccessToken(payload: AccessPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): AccessPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;
}

export const hoursFromNow = (h: number) => new Date(Date.now() + h * 60 * 60 * 1000);
export const daysFromNow = (d: number) => hoursFromNow(d * 24);
