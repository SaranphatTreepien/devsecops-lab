terraform {
  required_providers {
    kind = {
      source  = "tehcyx/kind"
      version = "0.6.0"
    }
  }
}

provider "kind" {}

resource "kind_cluster" "forge_ops" {
  name       = var.cluster_name
  node_image = var.node_image

  kind_config {
    kind        = "Cluster"
    api_version = "kind.x-k8s.io/v1alpha4"

    node {
      role = "control-plane"

      # expose ports สำหรับ Nginx Ingress
      extra_port_mappings {
        container_port = 80
        host_port      = 8888
        protocol       = "TCP"
      }
      extra_port_mappings {
        container_port = 443
        host_port      = 8443
        protocol       = "TCP"
      }
    }

    node {
      role = "worker"
    }

    node {
      role = "worker"
    }
  }
}