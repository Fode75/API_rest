import 'dotenv/config';
import express from 'express';
import { pool } from './db.js';
import ticketsRouter from './routes/tickets.js';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL manquant : vérifie ton fichier .env');
  process.exit(1);
}

const app = express();
app.use(express.json());

// Journal : affiche chaque requête reçue
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Vérifie que l'API ET la base répondent
app.get('/sante', async (req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({ api: 'ok', base: 'ok' });
  } catch (err) { next(err); }
});

app.use('/tickets', ticketsRouter);

// Route inconnue
app.use((req, res) => res.status(404).json({ erreur: 'Route introuvable' }));

// Gestionnaire d'erreurs (4 paramètres obligatoires)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erreur: 'JSON invalide' });
  }
  console.error('ERREUR :', err.code ?? '', err.message);
  console.error(err.stack);
  res.status(500).json({ erreur: 'Erreur serveur' });
});

app.listen(process.env.PORT || 3000, () => console.log('API prête'));
