# 🚀 Full DevSecOps Platform Architecture (Box + Arrow - End-to-End)

## 🧠 Overview

ระบบนี้ครอบคลุม:

* Dev → CI → CD → Kubernetes → Observability → Security → Cloud → Platform

---

## 🌐 End-to-End Architecture (Complete Flow)

```text id="full-box-flow"
┌──────────────┐
│  Developer   │
└──────┬───────┘
       │ commit / push
       ▼
┌──────────────┐
│   GitHub     │
│ Code + YAML  │
└──────┬───────┘
       │
       ├───────────────────────────────┐
       ▼                               ▼

┌──────────────────────────────┐   ┌──────────────────────────────┐
│        CI PIPELINE           │   │          CD PIPELINE         │
│     (GitHub Actions)         │   │           Argo CD            │
└──────────────┬───────────────┘   └──────────────┬───────────────┘
               │                                   │
   ┌───────────┼────────────┐                      │
   ▼           ▼            ▼                      ▼
[Gitleaks] [CodeQL/Bandit] [Tests]     ┌──────────────────────────┐
 Secret     SAST Scan      Unit Test   │     Argo CD Controller   │
 Scan                                   │ - Pull from Git (/k8s)  │
                                        │ - Detect changes        │
               │                        │ - Sync to cluster       │
               ▼                        └──────────────┬───────────┘
        ┌───────────────┐                           │
        │ Docker Build  │                           ▼
        └──────┬────────┘                ┌──────────────────────────┐
               ▼                         │ Kubernetes API Server    │
        ┌───────────────┐                └──────────────┬───────────┘
        │ Container Img │                               │
        └──────┬────────┘                               ▼
               ▼                         ┌──────────────────────────────┐
        ┌───────────────┐               │     Kubernetes Cluster       │
        │ Trivy Scan    │               │   (Kind / GKE Autopilot)     │
        ├───────────────┤               └──────────────┬───────────────┘
        │ Syft (SBOM)   │                              │
        ├───────────────┤                              ▼
        │ Cosign (Sign) │               ┌──────────────────────────────┐
        └──────┬────────┘               │        WORKLOAD LAYER        │
               ▼                        │ Deployment → Pods            │
        ┌───────────────┐               │ (user / product / order)     │
        │ Image Registry│               └──────────────┬───────────────┘
        │ (Docker/GCP)  │                              │
        └──────┬────────┘                              ▼
               │                        ┌──────────────────────────────┐
               ▼                        │         SERVICE LAYER        │
     (Image pull by K8s)                │        ClusterIP Service     │
                                        └──────────────┬───────────────┘
                                                       ▼
                                        ┌──────────────────────────────┐
                                        │        INGRESS LAYER         │
                                        │        Nginx Ingress         │
                                        └──────────────┬───────────────┘
                                                       ▼
                                        ┌──────────────────────────────┐
                                        │       LOAD BALANCER          │
                                        │   (Cloud LB / NodePort)      │
                                        └──────────────┬───────────────┘
                                                       ▼
                                        ┌──────────────────────────────┐
                                        │           END USER           │
                                        └──────────────────────────────┘
```

---

## 📊 Observability Layer (3 Pillars)

```text id="observability"
Pods
 │
 ├──► Prometheus ───► Grafana (Metrics Dashboard)
 │
 ├──► Promtail ─► Loki ─► Grafana (Logs)
 │
 └──► OpenTelemetry ─► Tempo/Jaeger ─► Grafana (Traces)
```

---

## 🔐 Security Layer (End-to-End)

```text id="security-flow"
CI Stage:
Code → Gitleaks → SAST → Test
     → Build Image → Trivy Scan
     → SBOM (Syft) → Sign (Cosign)

Runtime:
Kubernetes → Kyverno Policy Engine
   ├─ Block root container
   ├─ Enforce resource limits
   ├─ Require probes
   └─ Validate signed image
```

---

## 🔁 GitOps Flow (Argo CD)

```text id="gitops"
GitHub (/k8s)
   │
   ▼
Argo CD
   │
   ├─ Pull manifests
   ├─ Compare desired vs actual
   └─ Apply → Kubernetes

(Auto-heal / Drift detection)
```

---

## ☁️ Cloud Infrastructure

```text id="cloud"
Terraform
   │
   ▼
Provision:
 ├─ GKE Cluster
 ├─ VPC Network
 ├─ Artifact Registry
 ├─ Load Balancer
 └─ IAM / Workload Identity
```

---

## 🧠 Platform Engineering Layer

```text id="platform"
Developer
   │
   ▼
Backstage Portal
   │
   ├─ Create Service (Template)
   ├─ Generate Repo + CI/CD + YAML
   └─ Trigger Deployment
   │
   ▼
Argo CD → Kubernetes

Crossplane
   └─ Provision Infra (Self-service)
```

---

## 🔥 End-to-End Summary

```text id="summary"
Code → GitHub → CI (scan + build + push)
→ Argo CD → Kubernetes → User

Parallel Systems:
→ Metrics (Prometheus)
→ Logs (Loki)
→ Traces (Tempo)

Security:
→ CI Scan + Runtime Policy

Cloud:
→ Terraform → GKE

Platform:
→ Backstage + Crossplane
```

---

## 🎯 Notes

* เป็น architecture ระดับ Production (conceptual)
* ครอบคลุม DevOps + DevSecOps + SRE + Platform
* ใช้ทำ Portfolio / Interview ได้ทันที
