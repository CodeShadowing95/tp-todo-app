output "resource_group_name" {
  description = "Azure resource group name."
  value       = azurerm_resource_group.rg.name
}

output "aks_cluster_name" {
  description = "AKS cluster name."
  value       = azurerm_kubernetes_cluster.aks.name
}

output "aks_node_resource_group" {
  description = "Managed resource group created by AKS for cluster infrastructure."
  value       = azurerm_kubernetes_cluster.aks.node_resource_group
}

output "registry_name" {
  description = "Azure Container Registry name."
  value       = azurerm_container_registry.acr.name
}

output "registry_login_server" {
  description = "ACR login server used to tag and push Docker images."
  value       = azurerm_container_registry.acr.login_server
}

output "kubectl_credentials_command" {
  description = "Command to merge the AKS kubeconfig into the local kubectl context."
  value       = "az aks get-credentials --resource-group ${azurerm_resource_group.rg.name} --name ${azurerm_kubernetes_cluster.aks.name} --overwrite-existing"
}

output "acr_login_command" {
  description = "Command used to authenticate Docker against the Azure Container Registry."
  value       = "az acr login --name ${azurerm_container_registry.acr.name}"
}
