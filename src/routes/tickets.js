import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();
const STATUTS = ['ouvert', 'en_cours', 'resolu', 'ferme'];
const PRIORITES = ['basse', 'normale', 'haute', 'critique'];

// Créer un ticket
router.post('/', async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const { titre, description, priorite = 'normale', demandeur_email } = body;
    if (!titre || !demandeur_email) {
      return res.status(400).json({ erreur: 'titre et demandeur_email sont obligatoires' });
    }
    if (!PRIORITES.includes(priorite)) {
      return res.status(400).json({ erreur: 'priorité invalide' });
    }
    const { rows } = await pool.query(
      `INSERT INTO tickets (titre, description, priorite, demandeur_email)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [titre, description, priorite, demandeur_email]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// Lister les tickets (filtres : ?statut=...&priorite=...&assigne_a=...)
router.get('/', async (req, res, next) => {
  try {
    const { statut, priorite, assigne_a } = req.query;
    const conditions = [];
    const valeurs = [];
    if (statut)    { valeurs.push(statut);    conditions.push(`statut = $${valeurs.length}`); }
    if (priorite)  { valeurs.push(priorite);  conditions.push(`priorite = $${valeurs.length}`); }
    if (assigne_a) { valeurs.push(assigne_a); conditions.push(`assigne_a = $${valeurs.length}`); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await pool.query(
      `SELECT * FROM tickets ${where} ORDER BY created_at DESC`,
      valeurs
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// Consulter un ticket
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ erreur: 'id invalide' });
    const { rows } = await pool.query('SELECT * FROM tickets WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ erreur: 'Ticket introuvable' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// Mettre à jour un ticket (statut, priorite, assigne_a)
router.patch('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ erreur: 'id invalide' });

    const { statut, priorite, assigne_a } = req.body ?? {};
    if (statut !== undefined && !STATUTS.includes(statut)) {
      return res.status(400).json({ erreur: 'statut invalide' });
    }
    if (priorite !== undefined && !PRIORITES.includes(priorite)) {
      return res.status(400).json({ erreur: 'priorité invalide' });
    }

    const champs = [];
    const valeurs = [];
    if (statut !== undefined)    { valeurs.push(statut);    champs.push(`statut = $${valeurs.length}`); }
    if (priorite !== undefined)  { valeurs.push(priorite);  champs.push(`priorite = $${valeurs.length}`); }
    if (assigne_a !== undefined) { valeurs.push(assigne_a); champs.push(`assigne_a = $${valeurs.length}`); }

    if (champs.length === 0) {
      return res.status(400).json({ erreur: 'Aucun champ à modifier' });
    }

    champs.push('updated_at = now()');
    valeurs.push(id);
    const { rows } = await pool.query(
      `UPDATE tickets SET ${champs.join(', ')} WHERE id = $${valeurs.length} RETURNING *`,
      valeurs
    );
    if (rows.length === 0) return res.status(404).json({ erreur: 'Ticket introuvable' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

export default router;
