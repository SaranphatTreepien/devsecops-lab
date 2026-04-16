# forge-ops / devsecops-lab — Project Knowledge Base

> ไฟล์นี้สร้างขึ้นเพื่อให้ Claude เข้าใจ context ของโปรเจคนี้ในการสนทนาครั้งต่อไป

---

## Context โปรเจค

- **ชื่อโปรเจค:** `devsecops-lab 2` (folder จริง), `forge-ops` (cluster name)
- **วัตถุประสงค์:** DevSecOps Lab สำหรับสมัคร Internship ด้าน DevSecOps / Platform Engineering
- **เครื่องที่ใช้:** Windows, PowerShell
- **Path หลัก:** `C:\Kubernetes_Lab\devsecops-lab`
- **GitHub repo:** `devsecops-lab`
- **Kind cluster name:** `forge-ops`
- **Kubernetes namespace หลัก:** `forge-ops`
- **Observability namespace:** `observability`

---

## สถานะปัจจุบัน

```
✅ Project 1 — Local DevSecOps Platform ← COMPLETE
    ✅ Step 1 — 3 Microservices + Multi-stage Dockerfile
    ✅ Step 2 — Docker Compose + Observability (local)
    ✅ Step 3 — Terraform + Kind Cluster
    ✅ Step 4 — Deploy บน Kubernetes + Nginx Ingress
    ✅ Step 5 — GitHub Actions CI/CD Pipeline
    ✅ Step 6 — Security Scan (Gitleaks, Bandit, Trivy, CodeQL)
    ✅ Step 7 — Observability Stack บน K8s (Prometheus + Grafana + Loki)
    ✅ Step 8 — Troubleshoot + Incident Response Runbook

🔄 Project 2
    ✅ Phase 1 — ArgoCD + Vault
    ✅ Phase 2 — Distributed Tracing (Tempo + Jaeger)
    ⬜ Phase 3 — Load Testing (k6)  ← ต่อไป
    ⬜ Phase 4 — SLO + Alerting + Runbook

Services อยู่ที่ v4 แล้ว (มี OpenTelemetry ครบ)
Namespaces เพิ่ม: argocd, vault

⬜ Project 3 — Cloud Architecture (Design AWS, Deploy GCP)
    ⬜ Phase 1 — AWS Architecture Design + ADR + Cost Estimation
    ⬜ Phase 2 — AWS → GCP Mapping Document
    ⬜ Phase 3 — GCP Implementation (GKE + Artifact Registry)
    ⬜ Phase 4 — Terraform IaC บน GCP

⬜ Project 4 — Security Hardening + Chaos Engineering
    ⬜ Phase 1 — Policy as Code (Kyverno)
    ⬜ Phase 2 — Network Policy
    ⬜ Phase 3 — Supply Chain Security (SBOM + Cosign)
    ⬜ Phase 4 — Chaos Engineering (LitmusChaos)

⬜ Project 5 — Platform Engineering (IDP)
    ⬜ Phase 1 — Multi-tenant (Namespace + RBAC)
    ⬜ Phase 2 — Developer Portal (Backstage)
    ⬜ Phase 3 — Golden Path Templates
    ⬜ Phase 4 — Self-service Infra (Crossplane)
```

---

## ความสัมพันธ์ระหว่าง Project (ต่อยอดกัน)

```
Project 1 ✅
│  Docker, K8s, Terraform, CI/CD, Security Scan, Metrics + Logs
│
├──→ Project 2
│      ต่อยอด: K8s cluster เดิม + Observability เดิม
│      เพิ่ม:  ArgoCD, Vault, Tracing, Load Test, SLO
│      ได้:    GitOps workflow + Observability ครบ 3 pillars + SRE mindset
│
├──→ Project 3
│      ต่อยอด: services เดิม + CI/CD เดิม + Terraform pattern เดิม
│      เพิ่ม:  AWS diagram, GCP deploy จริง, Cloud IaC
│      ได้:    Cloud Architect thinking + AWS/GCP knowledge
│
├──→ Project 4
│      ต่อยอด: GKE cluster จาก Project 3 + pipeline เดิม
│      เพิ่ม:  Kyverno, Network Policy, SBOM, Cosign, LitmusChaos
│      ได้:    Production-grade security + Chaos Engineering
│
└──→ Project 5
       ต่อยอด: ทุกอย่างจาก Project 1-4
       เพิ่ม:  Multi-tenant, Backstage, Crossplane
       ได้:    Platform Engineer mindset + IDP design
```

---

## Stack ทั้งหมด

| Category | Tools | โปรเจคที่ใช้ |
|----------|-------|-------------|
| Languages | Python (FastAPI), Node.js (Express), Go | P1 |
| Container | Docker, Kind | P1 |
| Orchestration | Kubernetes, Helm, Nginx Ingress | P1 |
| IaC | Terraform | P1, P3 |
| CI/CD | GitHub Actions | P1 |
| Security Scan | Gitleaks, Bandit, Trivy, CodeQL | P1 |
| Observability - Metrics | Prometheus, Grafana | P1 |
| Observability - Logs | Loki | P1 |
| Observability - Traces | Tempo + Jaeger | P2 |
| Load Testing | k6 | P2 |
| GitOps | ArgoCD | P2 |
| Secret Management | HashiCorp Vault | P2 |
| SRE | SLO + Alertmanager + Runbook | P2 |
| Cloud Design | AWS Architecture Diagram | P3 |
| Cloud Deploy | GCP — GKE Autopilot (Free Tier) | P3 |
| Policy as Code | Kyverno | P4 |
| Network Security | K8s NetworkPolicy | P4 |
| Supply Chain | Syft (SBOM) + Cosign | P4 |
| Chaos Engineering | LitmusChaos | P4 |
| Multi-tenant | Namespace + RBAC | P5 |
| Developer Portal | Backstage | P5 |
| Self-service Infra | Crossplane | P5 |

---

## รายละเอียด Roadmap แต่ละ Project

### Project 2 — GitOps + Observability Complete + SRE
```
ต่อยอดจาก: Project 1 (Kind cluster เดิม)

Phase 1 — GitOps + Secret Management
├── ArgoCD
│   ├── ติดตั้งบน Kind cluster เดิม
│   ├── sync k8s/ manifests จาก GitHub อัตโนมัติ
│   ├── app-of-apps pattern
│   └── แทน kubectl apply manual ทั้งหมด
└── HashiCorp Vault
    ├── ติดตั้งบน Kind cluster
    ├── inject secrets เข้า pods อัตโนมัติ
    └── แทน hardcode env vars

Phase 2 — Distributed Tracing (3rd Pillar)
├── Grafana Tempo (backend) — ✅ ฟรี
├── Jaeger UI (visualization) — ✅ ฟรี
├── OpenTelemetry SDK ใส่ใน 3 services
└── Grafana เชื่อม Tempo datasource
    ครบ 3 pillars: Metrics + Logs + Traces ✅

Phase 3 — Load Testing
├── k6 รันบน Windows เลย — ✅ ฟรี
├── เขียน script ยิง request ไป forge-ops.local:8888
├── ดูผลใน Grafana dashboard เดิม
└── เพิ่ม load test step ใน GitHub Actions pipeline

Phase 4 — SRE Layer
├── SLO definition
│   ├── user-service    99.9% uptime
│   ├── product-service 99.9% uptime
│   └── order-service   99.5% uptime
├── Prometheus rules สำหรับ error budget
├── Grafana SLO Dashboard
├── Alertmanager rules
│   ├── Warning  → error budget เหลือ 50%
│   └── Critical → error budget เหลือ 10%
└── Runbook markdown ทุก service
```

---

### Project 3 — Cloud Architecture (Design AWS, Deploy GCP)
```
แนวคิดหลัก: ออกแบบด้วย AWS terminology → deploy จริงบน GCP ฟรี 100%

Phase 1 — AWS Architecture Design
├── วาด Architecture Diagram แบบ AWS
│   ├── VPC + Public/Private Subnet
│   ├── EKS (Kubernetes cluster)
│   ├── ECR (Container Registry)
│   ├── ALB (Application Load Balancer)
│   ├── S3 (Storage)
│   ├── CloudWatch (Monitoring + Logs)
│   ├── AWS Secrets Manager
│   └── IAM Roles + Policies
├── เขียน Architecture Decision Record (ADR)
└── Cost Estimation (ถ้า deploy AWS จริงจะเสียเท่าไหร่)

Phase 2 — AWS → GCP Mapping Document
├── EKS             → GKE Autopilot       (ฟรี Zonal)
├── ECR             → Artifact Registry   (ฟรี 0.5GB)
├── ALB             → Cloud Load Balancer
├── S3              → Cloud Storage       (ฟรี 5GB)
├── CloudWatch      → Cloud Monitoring    (ฟรี basic)
├── CloudWatch Logs → Cloud Logging       (ฟรี 50GB/เดือน)
├── Secrets Manager → Secret Manager      (ฟรี 6 secrets)
├── IAM             → IAM + Workload Identity
└── VPC             → VPC (GCP มีเหมือนกัน)

Phase 3 — GCP Implementation (ฟรี 100%)
├── GKE Autopilot cluster (Zonal)
├── Artifact Registry แทน Docker Hub
├── ปรับ CI/CD push image ไป Artifact Registry
├── deploy 3 services บน GKE
└── Cloud Monitoring + Cloud Logging

Phase 4 — Terraform IaC บน GCP
└── provision GKE + Artifact Registry ด้วย Terraform
    (ต่อยอดจาก Project 1 ที่ใช้ Terraform สร้าง Kind)

Cost Control GCP:
├── ตั้ง Budget Alert $0 ทันทีที่สร้าง account
├── ใช้ Zonal cluster เท่านั้น
├── ไม่เปิด Cloud SQL (มี cost)
└── destroy cluster เมื่อไม่ได้ใช้งาน
```

---

### Project 4 — Security Hardening + Chaos Engineering
```
ต่อยอดจาก: GKE cluster จาก Project 3 + pipeline เดิม

Phase 1 — Policy as Code
├── Kyverno ติดตั้งบน K8s — ✅ ฟรี
│   ├── ห้าม run as root
│   ├── บังคับมี resource limits
│   ├── บังคับมี liveness probe
│   └── ห้าม pull image tag latest
└── policies/ folder ใน repo

Phase 2 — Network Policy
├── K8s NetworkPolicy
│   ├── แต่ละ service คุยกันได้แค่ที่จำเป็น
│   └── block traffic จากภายนอกที่ไม่ได้ตั้งใจ
└── Cilium (optional — visualize network)

Phase 3 — Supply Chain Security
├── Syft → generate SBOM ทุก image — ✅ ฟรี
├── Cosign → sign + verify images — ✅ ฟรี
└── Admission Controller
    └── ปฏิเสธ image ที่ไม่ได้ sign

Phase 4 — Chaos Engineering
├── LitmusChaos ติดตั้งบน K8s — ✅ ฟรี
│   ├── kill pods แบบสุ่ม
│   ├── ทดสอบ network failure
│   └── CPU/Memory stress test
└── ดูว่า SLO จาก Project 2 ยังผ่านไหมระหว่าง chaos
```

---

### Project 5 — Platform Engineering (IDP)
```
ต่อยอดจาก: ทุกอย่างจาก Project 1-4

Phase 1 — Multi-tenant
├── แยก Namespace ต่อ team — ✅ ฟรี
│   ├── namespace: team-a
│   └── namespace: team-b
├── RBAC — จำกัดสิทธิ์แต่ละ namespace
└── Kyverno policy ห้าม team ข้าม namespace

Phase 2 — Developer Portal (Backstage)
├── Backstage ติดตั้งบน K8s — ✅ ฟรี
│   ├── catalog services จาก Project 1-3
│   ├── เชื่อม GitHub, ArgoCD, GKE
│   └── แสดง SLO status จาก Grafana
└── ทุก service มี TechDoc ใน Backstage

Phase 3 — Golden Path Templates
├── template สร้าง microservice ใหม่
│   ├── generate code structure
│   ├── generate Dockerfile
│   ├── generate K8s manifests
│   └── generate CI/CD pipeline
└── dev กด click เดียว → ได้ repo พร้อม deploy

Phase 4 — Self-service Infra (Crossplane)
├── Crossplane บน GKE — ✅ ฟรี
│   ├── dev ขอ namespace + RBAC เองได้
│   ├── dev ขอ storage bucket เองได้
│   └── ไม่ต้องรอ ops team
└── เชื่อมกับ Backstage UI
```

---

## โครงสร้างไฟล์ปัจจุบัน (Project 1)

```
C:\Kubernetes_Lab\devsecops-lab/
├── services/
│   ├── user-service/        # Python FastAPI — port 8000
│   │   ├── main.py          # /health /users /metrics
│   │   ├── requirements.txt # fastapi, uvicorn, prometheus-client
│   │   └── Dockerfile       # multi-stage
│   ├── product-service/     # Node.js Express — port 3000
│   │   ├── index.js         # /health /products /metrics
│   │   ├── package.json     # express, prom-client
│   │   └── Dockerfile       # multi-stage node:20-alpine
│   └── order-service/       # Go — port 8080
│       ├── main.go          # /health /orders /metrics
│       ├── go.mod           # prometheus/client_golang
│       └── Dockerfile       # multi-stage golang:alpine
├── k8s/
│   ├── namespace.yaml       # namespace: forge-ops
│   ├── user-service/
│   │   ├── deployment.yaml  # replicas:2, securityContext, probe
│   │   └── service.yaml     # ClusterIP port 80 → 8000
│   ├── product-service/
│   │   ├── deployment.yaml
│   │   └── service.yaml     # ClusterIP port 80 → 3000
│   ├── order-service/
│   │   ├── deployment.yaml
│   │   └── service.yaml     # ClusterIP port 80 → 8080
│   └── ingress.yaml         # forge-ops.local:8888
├── terraform/
│   ├── main.tf              # Kind cluster, provider: tehcyx/kind v0.6.0
│   ├── variables.tf         # cluster_name=forge-ops
│   └── outputs.tf
├── observability/
│   ├── values-prometheus.yaml  # kube-prometheus-stack
│   ├── values-grafana.yaml     # datasource: Prometheus + Loki
│   └── values-loki.yaml        # SingleBinary, chunksCache disabled
├── .github/
│   └── workflows/
│       └── ci.yml           # 6-stage pipeline
├── prometheus/
│   └── prometheus.yml       # สำหรับ Docker Compose
├── loki/
│   └── loki-config.yml
├── promtail/
│   └── promtail-config.yml
├── scripts/
│   └── health-check.sh
└── docker-compose.yml
```

---

## Kubernetes Cluster Detail

```
Cluster name: forge-ops
Nodes:
├── forge-ops-control-plane  ← Nginx Ingress ต้องอยู่ที่นี่
├── forge-ops-worker
└── forge-ops-worker2

Port mapping (บน control-plane):
├── host:8888 → container:80
└── host:8443 → container:443

Access URL: http://forge-ops.local:8888
hosts file: 127.0.0.1 forge-ops.local
```

---

## CI/CD Pipeline Flow (Project 1)

```
GitHub push
    ↓
secret-scan (Gitleaks)
    ├── sast (Bandit — Python)
    ├── codeql (Python + JS)
    └── test (pytest + npm test)
            ↓ (รอครบทุกตัว)
          build → push Docker Hub
            ↓
          trivy (scan image CVE)
            ↓
          deploy summary
```

---

## Observability Stack (Project 1)

```
namespace: observability

Helm releases:
├── prometheus  ← prometheus-community/kube-prometheus-stack
├── grafana     ← grafana/grafana
└── loki        ← grafana/loki

Scrape targets (ผ่าน ClusterIP port 80):
├── user-service.forge-ops.svc.cluster.local:80/metrics
├── product-service.forge-ops.svc.cluster.local:80/metrics
└── order-service.forge-ops.svc.cluster.local:80/metrics

Port-forward:
├── Grafana    → kubectl port-forward svc/grafana 3001:3000 -n observability
└── Prometheus → kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n observability

Grafana login: admin / admin123
```

---

## AWS → GCP Service Mapping Reference

> ใช้สำหรับ Project 3 — ออกแบบด้วย AWS แต่ deploy จริงบน GCP

| AWS Service | หน้าที่ | GCP Equivalent | Free Tier |
|-------------|---------|----------------|-----------|
| EKS | Managed Kubernetes | GKE Autopilot | ✅ ฟรี (Zonal) |
| ECR | Container Registry | Artifact Registry | ✅ ฟรี 0.5GB |
| ALB | Load Balancer | Cloud Load Balancer | ใช้ GKE Ingress |
| S3 | Object Storage | Cloud Storage | ✅ ฟรี 5GB |
| CloudWatch | Monitoring + Metrics | Cloud Monitoring | ✅ ฟรี basic |
| CloudWatch Logs | Log Management | Cloud Logging | ✅ ฟรี 50GB/เดือน |
| AWS Secrets Manager | Secret Management | Secret Manager | ✅ ฟรี 6 secrets |
| IAM Roles | Access Management | IAM + Workload Identity | ✅ ฟรี |
| VPC | Virtual Network | VPC | ✅ ฟรี |
| Route 53 | DNS | Cloud DNS | มี cost เล็กน้อย |
| CodePipeline | CI/CD | GitHub Actions | ✅ ฟรี |
| RDS | Managed Database | Cloud SQL | ❌ มี cost — ข้าม |
| Lambda | Serverless | Cloud Run | ✅ ฟรี 2M req/เดือน |
| SNS | Notification | Pub/Sub | ✅ ฟรี tier มี |

---

## ปัญหาที่เจอและวิธีแก้

| ปัญหา | สาเหตุ | วิธีแก้ |
|-------|--------|---------|
| Ingress Empty reply | Ingress controller อยู่บน worker แต่ port map ที่ control-plane | patch deployment ย้าย ingress ไป control-plane |
| ErrImageNeverPull | image ชื่อไม่ตรงกับ deployment | build ให้ตรงชื่อ แล้ว kind load |
| Prometheus scrape DOWN | scrape port 8000 ตรงแต่ Service expose port 80 | เปลี่ยน target เป็น port 80 |
| loki-chunks-cache Pending | ขอ RAM 10GB แต่ worker ไม่พอ | ปิด chunksCache + resultsCache |
| kind command not found | PATH ไม่ได้ update หลัง install | เพิ่ม PATH manually |
| PowerShell multiline error | \ ไม่ใช่ line continuation ใน PowerShell | รัน command บรรทัดเดียว |

---

## คำสั่งที่ใช้บ่อย

```powershell
# เช็ค cluster
kubectl get nodes
kubectl get pods -n forge-ops
kubectl get pods -n observability

# Port-forward
kubectl port-forward svc/grafana 3001:3000 -n observability
kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n observability
kubectl port-forward svc/user-service 8000:80 -n forge-ops

# Build + Load image
docker build -t forge-ops/user-service:v2 ./services/user-service
kind load docker-image forge-ops/user-service:v2 --name forge-ops
kubectl set image deployment/user-service user-service=forge-ops/user-service:v2 -n forge-ops

# Helm upgrade
helm upgrade prometheus prometheus-community/kube-prometheus-stack --namespace observability --values observability/values-prometheus.yaml
helm upgrade loki grafana/loki --namespace observability --values observability/values-loki.yaml

# ทดสอบ endpoint
curl http://forge-ops.local:8888/users
curl http://forge-ops.local:8888/products
curl http://forge-ops.local:8888/orders
```

---

## หมายเหตุสำหรับ Claude

- **PowerShell ไม่รองรับ `\` line continuation** → รัน command บรรทัดเดียวเสมอ
- **Kind cluster ต้อง load image ก่อน** → `kind load docker-image` ทุกครั้งที่ build ใหม่
- **Ingress controller ต้องอยู่บน control-plane** → patch แล้ว อย่า reset
- **Observability scrape ผ่าน port 80** (ClusterIP) ไม่ใช่ port จริงของ service
- **loki ใช้ SingleBinary mode** ปิด cache ทั้งหมดเพราะ RAM จำกัด
- **Cloud approach:** ออกแบบ diagram ด้วย AWS → deploy จริงบน GCP Free Tier
- **ทุก tool ในโปรเจคนี้ฟรีหมด** ยกเว้น Cloud SQL และ Route 53
- **ภาษาที่ใช้คุย:** ไทย
