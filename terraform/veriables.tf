variable "cluster_name" {
  description = "Kind cluster name"
  type        = string
  default     = "forge-ops"
}

variable "node_image" {
  description = "Kubernetes node image"
  type        = string
  default     = "kindest/node:v1.32.0"
}