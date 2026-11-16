import 'dotenv/config';
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { authenticateToken, authorizeRoles, AuthRequest } from './middlewares/auth';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret_par_defaut';

app.use(express.json());

// 1. Route de test de santé et affichage de l'URL de la base de données
app.get('/health', async (req: Request, res: Response) => {
  try {
    await prisma.user.count();
    console.log('✅ Base de données connectée :', process.env.DATABASE_URL);
    res.status(200).json({ 
      status: "success", 
      message: "La base de données fonctionne et est connectée avec succès !" 
    });
  } catch (error) {
    console.error('❌ Échec de connexion à la base :', process.env.DATABASE_URL);
    res.status(500).json({ 
      status: "error", 
      message: "Impossible de joindre la base de données.", 
      details: error instanceof Error ? error.message : error 
    });
  }
});

// 2. Route de connexion (Login)
app.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "Ce compte a été désactivé." });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      message: "Connexion réussie",
      accessToken,
      user: { id: user.id, email: user.email, role: user.role, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur interne du serveur lors de la connexion." });
  }
});

// 3. Route pour rafraîchir l'Access Token
app.post('/auth/refresh-token', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token manquant." });
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!storedToken || storedToken.revoked) {
      return res.status(403).json({ error: "Refresh token invalide ou révoqué." });
    }

    jwt.verify(refreshToken, JWT_SECRET, (err: any) => {
      if (err) {
        return res.status(403).json({ error: "Refresh token expiré ou invalide." });
      }

      const newAccessToken = jwt.sign(
        { userId: storedToken.user.id, role: storedToken.user.role },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors du rafraîchissement du token." });
  }
});

// 4. Route d'invitation d'un utilisateur par le Super Admin
app.post('/admin/invite', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { email, name, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Un utilisateur avec cet email existe déjà." });
    }

    const invitationToken = crypto.randomBytes(32).toString('hex');
    const invitationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        role: role || 'USER',
        invitationToken,
        invitationExpires,
        isActive: true
      }
    });

    res.status(201).json({
      message: "Utilisateur invité avec succès.",
      invitationToken,
      user: { id: newUser.id, email: newUser.email, role: newUser.role }
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la création de l'invitation." });
  }
});

// 5. Créer un ticket (Utilisateur authentifié)
app.post('/tickets', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description } = req.body;
    const authorId = req.user?.userId;

    if (!title || !description) {
      return res.status(400).json({ error: "Le titre et la description sont requis." });
    }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        authorId: authorId!
      }
    });

    res.status(201).json({ message: "Ticket créé avec succès", ticket });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la création du ticket." });
  }
});

// 6. Lister les tickets (Pagination + filtrage par rôle)
app.get('/tickets', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', status } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const userRole = req.user?.role;
    const userId = req.user?.userId;

    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }
    if (userRole === 'USER') {
      whereClause.authorId = userId;
    }

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      skip,
      take: limitNum,
      include: { author: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.ticket.count({ where: whereClause });

    res.json({
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      tickets
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des tickets." });
  }
});

// Lancement du serveur sur toutes les interfaces IPv4
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Serveur démarré sur http://127.0.0.1:${PORT}`);
});

export { app };