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

## 6. Se connecter a l'ACR

```powershell
az acr login --name <acr-name>
```

## 7. Builder et pousser les images applicatives

Depuis la racine du projet, remplacer `<acr-login-server>` par la valeur retournee par Terraform:

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

## 8. Deployer les manifests Kubernetes

Le repertoire `k8s/overlays/azure/` remappe les images locales vers des images ACR. Remplacer d'abord `REPLACE_WITH_ACR_LOGIN_SERVER` dans `k8s/overlays/azure/kustomization.yaml`.

Puis appliquer l'overlay:

```powershell
kubectl apply -k k8s/overlays/azure
```

## 9. Secrets

Ne laissez pas de vrais secrets dans `k8s/secrets.yaml` en production. Pour une version plus robuste, deplacez `DATABASE_URL`, `AUTH_DATABASE_URL` et `JWT_SECRET` vers:

- `terraform.tfvars` ou des variables d'environnement CI/CD
- `Azure Key Vault`
- ou des `Kubernetes Secrets` geres hors du depot
