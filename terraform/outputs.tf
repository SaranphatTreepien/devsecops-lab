output "cluster_name" {
  description = "Kind cluster name"
  value       = kind_cluster.forge_ops.name
}

output "kubeconfig_path" {
  description = "Path to kubeconfig"
  value       = kind_cluster.forge_ops.kubeconfig_path
}

output "endpoint" {
  description = "Cluster API endpoint"
  value       = kind_cluster.forge_ops.endpoint
}