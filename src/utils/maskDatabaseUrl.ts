// Affiche l'URL de la base pour confirmer à quelle base on est connecté,
// mais remplace le mot de passe par **** pour qu'il ne finisse jamais dans les logs.
export function maskDatabaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.password) parsed.password = '****';
    return parsed.toString();
  } catch {
    return '(URL de base invalide)';
  }
}
