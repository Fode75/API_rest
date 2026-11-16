# hello-api

API « Hello World » avec Node.js, TypeScript et Express.

## Installation

```bash
npm install
```

## Développement (rechargement automatique)

```bash
npm run dev
```

## Production

```bash
npm run build
npm start
```

Le serveur écoute sur le port `3000` par défaut (modifiable avec la variable `PORT`).

## Routes

| Méthode | Route          | Réponse                           |
| ------- | -------------- | --------------------------------- |
| GET     | `/`            | `{ "message": "Hello, World!" }`  |
| GET     | `/hello/:name` | `{ "message": "Hello, <name>!" }` |
