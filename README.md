# TP Todo App — Guide d'installation

Application Todo full-stack en monorepo (client + API) avec observabilité (Prometheus/Grafana).

## Pré-requis

À avoir sur votre machine :

- Git
- Docker + Docker Compose (Docker Desktop recommandé)
- Node.js (idéalement 20+) et npm
- Ports disponibles : `5173`, `3000`, `9090`, `3001`

Optionnel (utile si vous lancez des scripts en local hors Docker) :

- Un terminal Unix (macOS/Linux/WSL)


## Démarrage rapide

```bash
git clone https://github.com/CodeShadowing95/tp-todo-app
cd tp-todo-app
```

Créer 2 fichiers `.env` :

- `.env` (root) : utilisé par les outils du monorepo (ex: scripts DB/migrations).
- `apps/backend/.env` : utilisé par l’API au démarrage (auth + accès DB).

Copiez-collez ces valeurs dans ces fichiers `.env`:
```bash
NODE_ENV=development

# Database
DATABASE_URL=postgresql://neondb_owner:npg_4xr1XykGAfZC@ep-wild-cloud-aliinkug-pooler.c-3.eu-central-1.aws.neon.tech/todo_db?sslmode=require&channel_binding=require

# Auth
JWT_SECRET=<your-secret-key>
```

Pour générer un secret JWT, vous pouvez utiliser la commande suivante :

```bash
openssl rand -hex 32
```

le code généré est votre secret JWT. Vous pouvez le copier dans le fichier `.env` de `apps/backend/.env` et dans `.env` (root).

## Démarrer l’application (Docker Compose)

Depuis la racine du projet :

```bash
docker compose up --build
```

Lance tous les services (backend, client, prometheus, grafana).

### Services & URLs

| Service | Conteneur | URL |
| --- | --- | --- |
| Frontend (Vite) | `todo_client` | http://localhost:5173/ |
| Backend (API) | `todo_backend` | http://localhost:3000/health |
| Prometheus | `todo_prometheus` | http://localhost:9090/ |
| Grafana | `todo_grafana` | http://localhost:3001/ |

### Vérifier que tout est “au vert”

Lister l’état des conteneurs :

```bash
docker compose ps
```

Points de contrôle :

- `todo_backend` doit être en état `healthy` (healthcheck via `GET /health`).
- `todo_client` n’a pas de healthcheck Docker par défaut : vérifiez qu’il est `Up` et que l’URL répond.

Vérifications rapides :

```bash
curl -i http://localhost:3000/health
curl -i http://localhost:5173/
```

## Accéder à l’application

Ouvrir :

- http://localhost:5173/

Le formulaire de connexion doit s’afficher.

### Compte de test

- Email : `test@example.com`
- Mot de passe : `Test1234`

Vous pouvez aussi créer un compte directement depuis l’interface.

Après connexion, vous serez redirigé vers la page de gestion : création et administration de vos todo-lists.

## Arrêter les services

# TP Todo App — Onboarding (FR)

Application composée de:
- Frontend React (Vite) : http://localhost:5173
- Backend Node/Express : http://localhost:3000
- Healthcheck backend : http://localhost:3000/health

## Lancer avec Docker (recommandé)

### Pré-requis
- Docker Desktop (ou Docker Engine) avec `docker compose`

### Étapes
1) Cloner le repo et se placer à la racine
```bash
git clone <URL_DU_REPO>
cd tp-todo-app
```

2) Démarrer les conteneurs (build inclus)
```bash
docker compose up -d --build
```

3) Initialiser la base de données (à faire une fois)
```bash
docker compose run --rm backend npm run migrate --workspace=db
```

4) Ouvrir l’application
- Frontend : http://localhost:5173
- Backend (optionnel) : http://localhost:3000/health

### Arrêter
```bash
docker compose down
```

### Logs utiles
```bash
docker compose logs -f backend
docker compose logs -f client
```

## Lancer sans Docker

### Pré-requis
- Node.js 20+
- npm
- Une base PostgreSQL accessible via `DATABASE_URL` (ex: Neon / Postgres local)

### Étapes
1) Installer les dépendances (monorepo)
```bash
npm install
```

2) Configurer les variables d’environnement du backend
- Créer/éditer `apps/backend/.env` avec au minimum:
```env
NODE_ENV=development
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<db>?sslmode=require
JWT_SECRET=change-me
```

3) Appliquer les migrations (à faire une fois)
```bash
DATABASE_URL="postgresql://..." npm run migrate --workspace=db
```

4) Lancer le backend (terminal 1)
```bash
npm run dev --workspace=apps/backend
```

5) Lancer le client (terminal 2)
```bash
npm run dev --workspace=apps/client
```

6) Ouvrir l’application
- Frontend : http://localhost:5173

## Dépannage rapide

- Si l’inscription/login affiche “Network error” en Docker: vérifier que les conteneurs `backend` et `client` tournent (`docker compose ps`) puis relancer `docker compose up -d --build`.
- Si l’auth renvoie une erreur serveur (500) au premier lancement: la base n’est probablement pas migrée → rejouer la commande de migration.
