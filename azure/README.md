# Deploiement Azure avec Terraform

Ce repertoire provisionne l'infrastructure Azure de base pour deployer l'application sur AKS:

- un `Resource Group`
- un `Azure Container Registry (ACR)`
- un cluster `AKS`
- le role `AcrPull` pour autoriser AKS a tirer les images depuis l'ACR

## Pre-requis

- `az` CLI
- `terraform`
- `docker`
- `kubectl`

## 1. Authentification Azure

```powershell
az login
az account set --subscription "<subscription-id>"
```

## 2. Preparer les variables Terraform

Copier l'exemple puis adapter les valeurs:

```powershell
Copy-Item terraform.tfvars.example terraform.tfvars
```

## 3. Provisionner l'infrastructure

Depuis le repertoire `azure/`:

```powershell
terraform init
terraform plan -out main.tfplan
terraform apply main.tfplan
```

## 4. Recuperer les informations utiles

```powershell
terraform output
```

En particulier:

- `registry_login_server`
- `kubectl_credentials_command`
- `acr_login_command`

## 5. Connecter kubectl au cluster AKS

```powershell
az aks get-credentials --resource-group <rg-name> --name <aks-name> --overwrite-existing
```

Verifier le contexte actif Kubernetes:

```powershell
kubectl config current-context
kubectl config get-contexts
```

Le contexte attendu est celui du cluster AKS (par ex. `todo-aks`).

## 6. Se connecter a l'ACR

```powershell
az acr login --name <acr-name>
```

Verifier le contexte Docker actif:

```powershell
docker context show
docker context ls
```

Le contexte `desktop-linux` est normal sur Docker Desktop.

## 7. Builder et pousser les images applicatives

Depuis la racine du projet, remplacer `<acr-login-server>` par la valeur retournee par Terraform:

```powershell
Set-Location C:\Users\ukisu\Documents\tp-todo-app
```

```powershell
docker build -t <acr-login-server>/todo-backend:latest -f apps/backend/Dockerfile .
docker push <acr-login-server>/todo-backend:latest

docker build -t <acr-login-server>/todo-auth:latest -f apps/auth/Dockerfile .
docker push <acr-login-server>/todo-auth:latest

docker build -t <acr-login-server>/todo-client:latest -f apps/client/Dockerfile apps/client
docker push <acr-login-server>/todo-client:latest

docker build -t <acr-login-server>/todo-gateway:latest -f gateway/Dockerfile .
docker push <acr-login-server>/todo-gateway:latest
```

Si vous obtenez une erreur du type `GetFileAttributesEx apps: Le fichier specifie est introuvable`, vous n'etes pas dans la racine du repository.

## 8. Deployer les manifests Kubernetes

Le repertoire `k8s/overlays/azure/` remappe les images vers ACR via la section `images`.
Verifier les valeurs de `newName` dans `k8s/overlays/azure/kustomization.yaml`.

Puis appliquer l'overlay:

```powershell
kubectl apply -k k8s/overlays/azure
```

Validation rapide:

```powershell
kubectl kustomize k8s/overlays/azure | Out-Null
kubectl get pods -n todo-app
kubectl get svc -n todo-app
```

## 8.b Depannage courant AKS

1. Pods `Pending` avec `Insufficient cpu`

Cause: nodepool trop petit (souvent 1 seul noeud).

```powershell
az aks nodepool scale --resource-group <rg-name> --cluster-name <aks-name> --name system --node-count 2
kubectl get pods -n todo-app -w
```

2. Erreur `PublicIPCountLimitReached` sur un service `LoadBalancer`

Cause: quota IP publique regional atteint (ex. 3 IP max).

Solutions:
- passer certains services en `ClusterIP` (ex. Prometheus), puis utiliser un port-forward;
- ou demander une augmentation de quota Azure.

Exemple d'acces Prometheus sans IP publique:

```powershell
kubectl port-forward -n todo-app svc/prometheus-service 9090:9090
```

## 9. Secrets

Ne laissez pas de vrais secrets dans `k8s/secrets.yaml` en production. Pour une version plus robuste, deplacez `DATABASE_URL`, `AUTH_DATABASE_URL` et `JWT_SECRET` vers:

- `terraform.tfvars` ou des variables d'environnement CI/CD
- `Azure Key Vault`
- ou des `Kubernetes Secrets` geres hors du depot
