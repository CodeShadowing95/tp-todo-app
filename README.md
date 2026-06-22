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
DATABASE_URL=<your-neon-database-url>

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

Lance tous les services (backend, auth, client, prometheus, grafana).

### Services & URLs

| Service | Conteneur | URL |
| --- | --- | --- |
| Frontend (Vite) | `todo_client` | http://localhost:5180/ |
| Backend (API) | `todo_backend` | http://localhost:3000/health |
| Auth (API) | `todo_auth` | http://localhost:3002/health |
| Prometheus | `todo_prometheus` | http://localhost:9091/ |
| Grafana | `todo_grafana` | http://localhost:3003/ |

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
curl -i http://localhost:5180/
```

## Accéder à l’application

Ouvrir :

- http://localhost:5180/

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

2) Configurer `apps/backend/.env` et `apps/auth/.env` avec vos URLs Neon et le même `JWT_SECRET`

3) Démarrer les conteneurs (build inclus)
```bash
docker compose up -d --build
```

4) Initialiser la base de données (à faire une fois)
```bash
docker compose run --rm backend npm run migrate --workspace=db
docker compose run --rm auth npm run migrate:auth --workspace=db
```

5) Ouvrir l’application
- Frontend : http://localhost:5180
- Backend (optionnel) : http://localhost:3000/health

### Arrêter
```bash
docker compose down
```

### Logs utiles
```bash
docker compose logs -f backend
docker compose logs -f auth
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

3) Configurer les variables d’environnement du service auth
- Créer/éditer `apps/auth/.env` avec au minimum:
```env
NODE_ENV=development
PORT=3001
AUTH_DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<auth_db>?sslmode=require
JWT_SECRET=change-me
```

4) Appliquer les migrations (à faire une fois)
```bash
DATABASE_URL="postgresql://..." npm run migrate --workspace=db
AUTH_DATABASE_URL="postgresql://..." npm run migrate:auth --workspace=db
```

5) Lancer le backend (terminal 1)
```bash
npm run dev --workspace=apps/backend
```

6) Lancer le service auth (terminal 2)
```bash
npm run dev --workspace=apps/auth
```

7) Lancer le client (terminal 3)
```bash
npm run dev --workspace=apps/client
```

6) Ouvrir l’application
- Frontend : http://localhost:5173

## Lancer avec Kubernetes (local)

### Pré-requis
- Docker Desktop avec Kubernetes activé
- `kubectl` configuré (automatique avec Docker Desktop)
- Images Docker buildées localement

### Étapes

**1) Builder les images Docker**

```bash
cd C:\Users\ukisu\Documents\tp-todo-app

# Backend
docker build -t todo-backend:latest -f apps/backend/Dockerfile apps/backend

# Frontend
docker build -t todo-client:latest -f apps/client/Dockerfile apps/client
```

**2) Créer le namespace**

```powershell
kubectl create namespace todo-app
```

**3) Appliquer tous les manifests Kubernetes**

```powershell
kubectl apply -f k8s/
```

Cela crée :
- ConfigMap avec variables d'env (`VITE_PROXY_TARGET`, `DATABASE_URL`, etc.)
- Secrets (données sensibles)
- Deployments : backend (2 replicas), client (2 replicas), Prometheus, Grafana
- Services : ClusterIP pour backend, LoadBalancer pour client/Grafana/Prometheus

**4) Vérifier que tout est déployé**

```powershell
kubectl get all -n todo-app
```

Vérifier que :
- `backend-deployment`: `2/2 Ready`
- `client-deployment`: `2/2 Ready`
- Tous les pods sont `Running` avec 0 restarts

```powershell
kubectl get pods -n todo-app
```

**5) Accéder à l'application**

**Option A : Via LoadBalancer (recommandé)**

```powershell
kubectl get svc client-service -n todo-app
```

L'EXTERNAL-IP sera `172.19.0.6` (ou similaire). Allez sur :
- **Frontend** : http://172.19.0.6:5173
- **Grafana** : http://172.19.0.5:3001
- **Prometheus** : http://172.19.0.7:9090

**Option B : Via port-forward (si LoadBalancer ne marche pas)**

```powershell
# Frontend
kubectl port-forward svc/client-service 5173:5173 -n todo-app

# Backend
kubectl port-forward svc/backend-service 3000:3000 -n todo-app

# Grafana
kubectl port-forward svc/grafana-service 3001:3001 -n todo-app

# Prometheus
kubectl port-forward svc/prometheus-service 9090:9090 -n todo-app
```

Puis allez sur :
- **Frontend** : http://localhost:5173
- **Backend health** : http://localhost:3000/health
- **Grafana** : http://localhost:3001
- **Prometheus** : http://localhost:9090

**6) Vérifier les logs**

```powershell
# Logs du client (suivi en temps réel)
kubectl logs -f -l app=client -n todo-app

# Logs du backend
kubectl logs -f -l app=backend -n todo-app

# Détails d'un pod spécifique
kubectl describe pod <pod-name> -n todo-app
```

**7) Arrêter tout**

```powershell
kubectl delete namespace todo-app
```

### Points clés pour Kubernetes local

| Aspect | Configuration |
|--------|---------------|
| **Health probes** | initialDelaySeconds: 40 pour Vite (démarrage lent) |
| **Proxy API** | `VITE_PROXY_TARGET=http://backend-service:3000` |
| **Service discovery** | Utiliser `backend-service:3000` (DNS interne) |
| **LoadBalancer IP** | Docker Desktop attribue une IP interne (172.19.x.x) |
| **Images Docker** | Doivent être présentes localement ou sur un registry |

## Dépannage rapide

- Si l'inscription/login affiche "Network error" en Docker: vérifier que les conteneurs `backend` et `client` tournent (`docker compose ps`) puis relancer `docker compose up -d --build`.
- Si l'auth renvoie une erreur serveur (500) au premier lancement: la base n'est probablement pas migrée → rejouer la commande de migration.
- En Kubernetes, si les pods crashent (`0/1 Running`): vérifier les logs avec `kubectl logs -f <pod-name> -n todo-app`
- Si le proxy API ne fonctionne pas: vérifier que `VITE_PROXY_TARGET` est bien configuré dans la ConfigMap (`kubectl get configmap app-config -n todo-app -o yaml`)
- LoadBalancer ne répond pas ? Utilisez `kubectl port-forward` à la place.
