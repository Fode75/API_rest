CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  titre TEXT NOT NULL,
  description TEXT,
  statut TEXT NOT NULL DEFAULT 'ouvert'
    CHECK (statut IN ('ouvert', 'en_cours', 'resolu', 'ferme')),
  priorite TEXT NOT NULL DEFAULT 'normale'
    CHECK (priorite IN ('basse', 'normale', 'haute', 'critique')),
  demandeur_email TEXT NOT NULL,
  assigne_a TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
