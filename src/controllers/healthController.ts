import { Request, Response } from 'express';
import { env } from '../utils/env';
import { maskDatabaseUrl } from '../utils/maskDatabaseUrl';
import { prisma } from '../utils/prisma';

// GET /health : lance une requête minimale sur la base pour vérifier qu'elle répond.
export async function health(_req: Request, res: Response) {
  const databaseUrl = maskDatabaseUrl(env.DATABASE_URL);

  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log(`[health] Base de données OK -> ${databaseUrl}`);
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error(`[health] Base de données INJOIGNABLE -> ${databaseUrl}`);
    console.error(error);
    res.status(503).json({
      status: 'error',
      database: 'unreachable',
      timestamp: new Date().toISOString(),
    });
  }
}
