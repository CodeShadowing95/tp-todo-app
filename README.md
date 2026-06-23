# TP Todo App — Guide d'installation

Application Todo full-stack en monorepo (client + API) avec observabilité (Prometheus/Grafana).

## Securite

La CI GitHub Actions lance egalement des scans de vulnerabilites avec Trivy :

- un scan du depot en mode filesystem pour les dependances et l'infrastructure as code ;
- un scan des images Docker construites pour `backend`, `auth`, `client` et `gateway`.

Les alertes `HIGH` et `CRITICAL` sont publiees dans l'onglet Security de GitHub via des rapports SARIF.

Exemple de verification locale :

```bash
trivy fs --severity HIGH,CRITICAL .
```

## Pré-requis

À avoir sur votre machine :

- Git
- Docker + Docker Compose (Docker Desktop recommandé)
- Node.js (idéalement 20+) et npm
- Ports disponibles : `8080`, `8443`, `9091`, `3003`

Optionnel (utile si vous lancez des scripts en local hors Docker) :

- Un terminal Unix (macOS/Linux/WSL)


## Démarrage rapide

```bash
git clone https://github.com/CodeShadowing95/tp-todo-app
cd tp-todo-app
```

Créer 3 fichiers `.env` :

- `.env` (root) : utilisé par les outils du monorepo (ex: scripts DB/migrations).
- `apps/backend/.env` : utilisé par le service `backend`.
- `apps/auth/.env` : utilisé par le microservice `auth`.

Copiez-collez ces valeurs dans ces fichiers `.env`:
```bash
NODE_ENV=development

# Backend database
DATABASE_URL=<your-neon-database-url>

# Auth database
AUTH_DATABASE_URL=<your-neon-auth-database-url>

# Auth
JWT_SECRET=<your-secret-key>
```

Pour générer un secret JWT, vous pouvez utiliser la commande suivante :

```bash
openssl rand -hex 32
```

Le code généré est votre secret JWT. Utilisez la même valeur dans `.env`, `apps/backend/.env` et `apps/auth/.env`.

## Démarrer l’application (Docker Compose)

Depuis la racine du projet :

```bash
docker compose up --build
```

Lance tous les services (gateway, backend, auth, client, redis-task, redis-auth, prometheus, grafana).

### Services & URLs

| Service | Conteneur | URL |
| --- | --- | --- |
| Gateway HTTP | `todo_gateway` | http://localhost:8080/ |
| Gateway HTTPS | `todo_gateway` | https://localhost:8443/ |
| Frontend (via gateway) | `todo_gateway` | https://localhost:8443/ |
| Backend (interne) | `todo_backend` | http://backend:3000/health |
| Auth (interne) | `todo_auth` | http://auth:3001/health |
| Prometheus | `todo_prometheus` | http://localhost:9091/ |
| Grafana | `todo_grafana` | http://localhost:3003/ |

### Vérifier que tout est “au vert”

Lister l’état des conteneurs :

```bash
docker compose ps
```

Points de contrôle :

- `todo_gateway` doit être en état `healthy`.
- `todo_backend` doit être en état `healthy` (healthcheck via `GET /health`).
- `todo_auth` doit être en état `healthy`.
- `todo_client` doit être `healthy` avant que le gateway ne soit complètement disponible.

Vérifications rapides :

```bash
curl -i http://localhost:8080/health
curl -k -i https://localhost:8443/health
curl -k -i https://localhost:8443/
```

## Accéder à l’application

Ouvrir :

- https://localhost:8443/

Le formulaire de connexion doit s’afficher.

### Compte de test

- Email : `test@example.com`
- Mot de passe : `Test1234`

Vous pouvez aussi créer un compte directement depuis l’interface.

Après connexion, vous serez redirigé vers la page de gestion : création et administration de vos todo-lists.

## Arrêter les services

# TP Todo App — Onboarding (FR)

Application composée de:
- Gateway Nginx : https://localhost:8443
- Frontend React (Vite) derrière le gateway
- Backend Node/Express derrière le gateway
- Microservice auth derrière le gateway
- Deux branches Redis distinctes : `redis-task` et `redis-auth`

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
- Gateway HTTPS : https://localhost:8443
- Gateway HTTP : http://localhost:8080
- Prometheus : http://localhost:9091
- Grafana : http://localhost:3003

Le gateway sert d’entrée publique unique:
- `/` -> client Vite
- `/api/auth/*` -> microservice `auth`
- `/api/*` -> service `backend`

Le certificat TLS est auto-généré au démarrage pour le local, donc le navigateur affichera un avertissement de certificat auto-signé au premier accès.

### Arrêter
```bash
docker compose down
```

### Logs utiles
```bash
docker compose logs -f backend
docker compose logs -f auth
docker compose logs -f client
docker compose logs -f gateway
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
docker build -t todo-backend:latest -f apps/backend/Dockerfile .

# Auth
docker build -t todo-auth:latest -f apps/auth/Dockerfile .

# Frontend
docker build -t todo-client:latest -f apps/client/Dockerfile apps/client

# Gateway
docker build -t todo-gateway:latest -f gateway/Dockerfile .
```

**2) Configurer les secrets Kubernetes**

```powershell
notepad k8s\secrets.yaml
```

Renseignez au minimum :
- `DATABASE_URL`
- `AUTH_DATABASE_URL`
- `JWT_SECRET`

**3) Appliquer tous les manifests Kubernetes**

```powershell
kubectl apply -k k8s
```

Cela crée :
- Un gateway Nginx exposé publiquement en `LoadBalancer`, sans Ingress
- Des services internes `backend`, `auth` et `client` en `ClusterIP`
- Deux branches Redis internes : `redis-task` et `redis-auth`
- Prometheus et Grafana pour l'observabilité

**4) Vérifier que tout est déployé**

```powershell
kubectl get all -n todo-app
```

Vérifier que :
- `gateway-deployment`: `1/1 Ready`
- `backend-deployment`: `1/1 Ready`
- `auth-deployment`: `1/1 Ready`
- `client-deployment`: `1/1 Ready`
- `redis-task-deployment`: `1/1 Ready`
- `redis-auth-deployment`: `1/1 Ready`
- Tous les pods sont `Running` avec 0 restarts

```powershell
kubectl get pods -n todo-app
```

**5) Accéder à l'application**

Le cluster n'utilise pas d'Ingress. Le point d'entrée public est le `Service` `gateway` :

```powershell
kubectl get svc gateway -n todo-app
```

Selon l'environnement local, l'`EXTERNAL-IP` sera soit une IP Docker Desktop, soit `localhost`.

URLs utiles :
- **Gateway HTTP** : `http://<EXTERNAL-IP>:8080`
- **Gateway HTTPS** : `https://<EXTERNAL-IP>:8443`
- **Grafana** : `http://<EXTERNAL-IP-GRAFANA>:3001`
- **Prometheus** : `http://<EXTERNAL-IP-PROMETHEUS>:9090`

Routage exposé par le gateway :
- `/` -> client Vite
- `/api/auth/*` -> microservice `auth`
- `/api/*` -> service `backend`

**Option B : Via port-forward (si LoadBalancer ne marche pas)**

```powershell
# Gateway
kubectl port-forward svc/gateway 8080:8080 8443:8443 -n todo-app

# Grafana
kubectl port-forward svc/grafana-service 3001:3001 -n todo-app

# Prometheus
kubectl port-forward svc/prometheus-service 9090:9090 -n todo-app
```

Puis allez sur :
- **Gateway HTTP** : http://localhost:8080
- **Gateway HTTPS** : https://localhost:8443
- **Grafana** : http://localhost:3001
- **Prometheus** : http://localhost:9090

Comme en Docker Compose, le certificat TLS du gateway est auto-signé et généré au démarrage. Le navigateur affichera donc un avertissement au premier accès en `https`.

**6) Vérifier les logs**

```powershell
# Logs du gateway
kubectl logs -f -l app=gateway -n todo-app

# Logs du client
kubectl logs -f -l app=client -n todo-app

# Logs du backend
kubectl logs -f -l app=backend -n todo-app

# Logs de l'auth
kubectl logs -f -l app=auth -n todo-app

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
| **Entrée publique** | `Service` `gateway` en `LoadBalancer`, sans Ingress |
| **Proxy API client** | `VITE_PROXY_TARGET=http://backend:3000` et `VITE_AUTH_PROXY_TARGET=http://auth:3001` |
| **Service discovery** | Utiliser `backend:3000`, `auth:3001`, `client:5173`, `redis-task:6379`, `redis-auth:6379` |
| **LoadBalancer IP** | Docker Desktop attribue une IP interne (172.19.x.x) |
| **Images Docker** | Doivent être présentes localement ou sur un registry |

## Dépannage rapide

- Si l'inscription/login affiche "Network error" en Docker: vérifier que `gateway`, `backend`, `auth` et `client` tournent (`docker compose ps`) puis relancer `docker compose up -d --build`.
- Si l'auth renvoie une erreur serveur (500) au premier lancement: la base n'est probablement pas migrée → rejouer la commande de migration.
- En Kubernetes, si les pods crashent (`0/1 Running`): vérifier les logs avec `kubectl logs -f <pod-name> -n todo-app`
- Si le proxy API ne fonctionne pas: vérifier que `VITE_PROXY_TARGET` est bien configuré dans la ConfigMap (`kubectl get configmap app-config -n todo-app -o yaml`)
- LoadBalancer ne répond pas ? Utilisez `kubectl port-forward` à la place.
