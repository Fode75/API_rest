# 🎫 Support Ticketing API

API REST robuste et sécurisée de gestion de tickets d'assistance technique, développée en **TypeScript** avec **Node.js**, **Express**, **Prisma ORM** et **PostgreSQL**.

---

## 🚀 Stack Technique

* **Langage :** TypeScript (Node.js)
* **Framework :** Express.js
* **Base de données :** PostgreSQL (distant)
* **ORM :** Prisma
* **Sécurité :** Bcrypt (hachage des mots de passe), JWT (Access Tokens & Refresh Tokens), Crypto (jetons d'invitation sécurisés)

---

## 📂 Architecture du Projet

```text
hello-api/
├── prisma/
│   └── schema.prisma      # Modèle de données (User, Ticket, RefreshToken)
├── src/
│   ├── middlewares/
│   │   └── auth.ts        # Middlewares d'authentification et contrôle des rôles (RBAC)
│   └── index.ts           # Point d'entrée, routes et logique métier
├── .env                   # Variables d'environnement (confidentiel)
├── package.json           # Dépendances et scripts de gestion
└── tsconfig.json          # Configuration TypeScript