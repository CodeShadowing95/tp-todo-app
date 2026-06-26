locals {
  normalized_project_name = substr(replace(lower(var.project_name), "/[^0-9a-z]/", ""), 0, 12)
  acr_name                = "${local.normalized_project_name}${random_string.acr_suffix.result}acr"

  default_tags = {
    project     = var.project_name
    environment = "production"
    managed_by  = "terraform"
  }

  tags = merge(local.default_tags, var.tags)
}

resource "random_pet" "rg_name" {
  prefix = var.resource_group_prefix
}

resource "random_string" "acr_suffix" {
  length  = 6
  lower   = true
  numeric = true
  special = false
  upper   = false
}

resource "azurerm_resource_group" "rg" {
  name     = random_pet.rg_name.id
  location = var.resource_group_location
  tags     = local.tags
}

resource "azurerm_container_registry" "acr" {
  name                = local.acr_name
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = var.acr_sku
  admin_enabled       = false
  tags                = local.tags
}

resource "azurerm_kubernetes_cluster" "aks" {
  name                = var.aks_name
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = var.dns_prefix
  kubernetes_version  = var.kubernetes_version != "" ? var.kubernetes_version : null
  sku_tier            = var.aks_sku_tier

  default_node_pool {
    name                = "system"
    node_count          = var.node_count
    vm_size             = var.node_vm_size
    os_disk_size_gb     = var.node_os_disk_size_gb
    orchestrator_version = var.kubernetes_version != "" ? var.kubernetes_version : null
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin    = "azure"
    network_policy    = "azure"
    load_balancer_sku = "standard"
  }

  oidc_issuer_enabled         = true
  workload_identity_enabled   = true
  role_based_access_control_enabled = true
  automatic_upgrade_channel   = var.automatic_upgrade_channel
  image_cleaner_enabled       = true
  image_cleaner_interval_hours = 48
  tags                        = local.tags
}

resource "azurerm_role_assignment" "aks_acr_pull" {
  scope                = azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_kubernetes_cluster.aks.kubelet_identity[0].object_id

  depends_on = [
    azurerm_container_registry.acr,
    azurerm_kubernetes_cluster.aks,
  ]
}
