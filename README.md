# hello-api

API REST avec Node.js, TypeScript, Express et Prisma (PostgreSQL), avec authentification
et invitation d'utilisateurs par e-mail (Resend).

## Structure

```
src/
  routers/       définition des routes
  controllers/   lisent la requête, appellent un service, répondent
  services/      logique métier (auth, utilisateurs, e-mails Resend)
  middlewares/   authenticate, authorize, validate, erreurs, rate limit
  utils/         env, prisma, jetons, erreurs, schémas de validation
prisma/          schema.prisma et seed
```

## Installation

```bash
cp .env.example .env     # puis remplir DATABASE_URL, secrets JWT, RESEND_API_KEY
npm install
npm run prisma:migrate   # crée les tables (donne un nom, ex. init)
npm run prisma:seed      # crée le premier Super Admin (pas d'inscription publique)
npm run dev
```

## Scripts

| Script                                                   | Rôle                                  |
| -------------------------------------------------------- | ------------------------------------- |
| `dev` / `build` / `start`                                | développement, compilation, production |
| `prisma:generate`, `prisma:format`, `prisma:validate`    | client, formatage, validation du schéma |
| `prisma:migrate`, `prisma:deploy`, `prisma:status`       | migrations (dev, prod, état)           |
| `prisma:reset`, `prisma:push`, `prisma:studio`           | reset, push du schéma, interface web   |
| `prisma:seed`                                            | crée le Super Admin du `.env`          |

## Routes

| Méthode | Route                              | Accès         | Rôle                                   |
| ------- | ---------------------------------- | ------------- | -------------------------------------- |
| GET     | `/`, `/hello/:name`                | public        | routes d'origine                       |
| GET     | `/health`                          | public        | teste la base, log de l'URL (masquée)  |
| POST    | `/api/auth/login`                  | public        | connexion                              |
| POST    | `/api/auth/refresh`                | public        | nouveau couple de jetons               |
| POST    | `/api/auth/logout`                 | public        | invalide le refresh token              |
| POST    | `/api/auth/forgot-password`        | public        | envoie le lien de réinitialisation     |
| POST    | `/api/auth/reset-password`         | public        | choisit un nouveau mot de passe        |
| POST    | `/api/auth/accept-invitation`      | public        | active le compte invité                |
| GET     | `/api/auth/me`                     | connecté      | profil                                 |
| POST    | `/api/auth/change-password`        | connecté      | change le mot de passe                 |
| POST    | `/api/admin/users/invite`          | Admin         | invite un utilisateur (e-mail Resend)  |
| GET     | `/api/admin/users`                 | Admin         | liste des utilisateurs                 |
| PATCH   | `/api/admin/users/:id/status`      | Admin         | désactive / réactive un compte         |
