import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { prisma } from './utils/prisma';
import { globalLimiter } from './middlewares/rateLimiter';
import authRouter from './routers/auth.router';
import adminRouter from './routers/admin.router';
import ticketRouter from './routers/ticket.router';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Sécurisation des en-têtes HTTP et taille maximale JSON
app.use(helmet());
app.use(express.json({ limit: '10kb' }));

// 2. Limitation de débit globale (100 req / 15 min)
app.use(globalLimiter);

// 3. Route de santé sécurisée (VULN-003)
app.get('/health', async (req: Request, res: Response) => {
  try {
    await prisma.user.count();
    return res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('[HEALTH CHECK ERROR] Échec de connexion à la base de données.');
    return res.status(503).json({
      status: 'error',
      message: 'Service temporairement indisponible.'
    });
  }
});

// 4. Montage des routeurs modulaires
app.use('/auth', authRouter);
app.use('/admin', adminRouter);
app.use('/tickets', ticketRouter);

app.listen(PORT, () => {
  console.log(`Serveur API sécurisé démarré sur http://127.0.0.1:${PORT}`);
});