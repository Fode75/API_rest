# API REST Ticketing Sécurisée (`hello-api`)

API REST de gestion de tickets d'assistance développée avec **Node.js**, **Express**, **TypeScript**, **Prisma ORM** et **PostgreSQL**, intégrant un audit de sécurité et des mesures de remédiation conformes au référentiel **OWASP API Security Top 10 (2023)**.

---

## 1. Prérequis & Installation

### Prérequis
- **Node.js** (v18+ ou v22+)
- **PostgreSQL** (local, Docker ou instance distante)

### Installation
```bash
# 1. Cloner le dépôt et installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env
# Renseigner DATABASE_URL et JWT_SECRET dans le fichier .env

# 3. Synchroniser le schéma Prisma avec la base de données
npx prisma generate
npx prisma db push

# 4. Démarrer le serveur en mode développement
npm run dev