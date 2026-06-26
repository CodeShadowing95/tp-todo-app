variable "subscription_id" {
  type        = string
  default     = ""
  description = "Azure subscription ID. Leave empty to reuse the current az login context."
}

variable "tenant_id" {
  type        = string
  default     = ""
  description = "Azure tenant ID. Leave empty to reuse the current az login context."
}

variable "project_name" {
  type        = string
  default     = "todoapp"
  description = "Short project name used to derive Azure resource names."
}

variable "resource_group_location" {
  type        = string
  default     = "polandcentral"
  description = "Azure region used for the resource group and AKS cluster."
}

variable "resource_group_prefix" {
  type        = string
  default     = "rg-todo"
  description = "Prefix used when generating the Azure resource group name."
}

variable "acr_sku" {
  type        = string
  default     = "Basic"
  description = "SKU for Azure Container Registry."
}

variable "aks_name" {
  type        = string
  default     = "todo-aks"
  description = "AKS cluster name."
}

variable "dns_prefix" {
  type        = string
  default     = "todo-aks"
  description = "DNS prefix used by AKS."
}

variable "kubernetes_version" {
  type        = string
  default     = ""
  description = "Optional AKS Kubernetes version. Leave empty to use Azure default."
}

variable "node_count" {
  type        = number
  default     = 1
  description = "Number of nodes in the default AKS node pool."
}

variable "node_vm_size" {
  type        = string
  default     = "Standard_B2s_v2"
  description = "VM size used by the default AKS node pool."
}

variable "node_os_disk_size_gb" {
  type        = number
  default     = 64
  description = "OS disk size in GB for AKS nodes."
}

variable "automatic_upgrade_channel" {
  type        = string
  default     = "patch"
  description = "AKS automatic upgrade channel."
}

variable "aks_sku_tier" {
  type        = string
  default     = "Free"
  description = "AKS SKU tier."
}

variable "tags" {
  type        = map(string)
  default     = {}
  description = "Optional tags applied to Azure resources."
}
