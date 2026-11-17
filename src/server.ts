import app from './app';
import { env } from './utils/env';
import { maskDatabaseUrl } from './utils/maskDatabaseUrl';
import { prisma } from './utils/prisma';

async function start() {
  // Confirmation au démarrage : à quelle base l'API est connectée ?
  console.log(`[db] DATABASE_URL = ${maskDatabaseUrl(env.DATABASE_URL)}`);

  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('[db] Connexion à la base de données réussie');
  } catch (error) {
    console.error('[db] Connexion à la base de données impossible :', error);
  }

  const server = app.listen(env.PORT, () => {
    console.log(`API démarrée sur http://localhost:${env.PORT} (health : /health)`);
  });

  // Arrêt propre (Ctrl+C) : on ferme le serveur puis la connexion Prisma.
  const shutdown = () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start();
