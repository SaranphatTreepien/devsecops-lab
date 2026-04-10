# 🛡️ DevSecOps Lab — forge-ops

> End-to-end DevSecOps project จำลอง production-like system ครบวงจร  
> ตั้งแต่ development → security → CI/CD → deploy → monitoring → incident response

---

## 📋 Project Overview

โปรเจคนี้เป็น DevSecOps lab สำหรับการฝึกปฏิบัติ โดยสร้าง 3 microservices และ deploy บน Kubernetes cluster เพื่อเรียนรู้การทำงานของระบบแบบ distributed พร้อมติดตั้ง observability stack แบบพื้นฐาน เพื่อฝึกการ monitor และ debug ระบบ โดยเน้นการทำความเข้าใจ workflow และ practices ที่ใช้ในงานจริง<img width="2752" height="1536" alt="Overview" src="https://github.com/user-attachments/assets/bb4445e4-818e-44ea-8520-037e4c1accf4" />


```
Developer pushes code
        ↓
GitHub Actions (CI/CD)
  ├── Secret Scan (Gitleaks)
  ├── SAST (Bandit + CodeQL)
  ├── Unit Tests
  ├── Build & Push Docker images
  └── Image Scan (Trivy)
        ↓
Kubernetes (Kind)
  ├── 3 Microservices
  └── Nginx Ingress
        ↓
Observability Stack
  ├── Prometheus (metrics)
  ├── Grafana (dashboard)
  └── Loki + Promtail (logs)
        ↓
Incident Response Runbook
```

---

## 🗂️ Project Structure

```
devsecops-lab/
├── .github/
│   └── workflows/
│       └── ci.yml              # CI/CD Pipeline
├── services/
│   ├── order-service/          # Go — จัดการ orders
│   │   ├── main.go
│   │   ├── go.mod
│   │   ├── go.sum
│   │   └── Dockerfile
│   ├── product-service/        # Node.js — จัดการ products
│   │   ├── index.js
│   │   ├── package.json
│   │   └── Dockerfile
│   └── user-service/           # Python (FastAPI) — จัดการ users
│       ├── main.py
│       ├── requirements.txt
│       └── Dockerfile
├── k8s/
│   ├── namespace.yaml          # forge-ops namespace
│   ├── ingress.yaml            # Nginx Ingress rules
│   ├── order-service/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   ├── product-service/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   └── user-service/
│       ├── deployment.yaml
│       └── service.yaml
├── observability/
│   ├── values-prometheus.yaml  # Prometheus + Grafana config
│   ├── values-loki.yaml        # Loki config
│   └── values-promtail.yaml    # Promtail config
├── terraform/                  # Infrastructure as Code (Kind cluster)
├── docker-compose.yml          # Local development
├── docs/
│   └── runbook.md              # Incident Response Runbook
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Tool | ทำหน้าที่อะไร |
|-------|------|---------------|
| **Container** | Docker | Package application เป็น image |
| **Orchestration** | Kubernetes (Kind) | จัดการ pods, scaling, self-healing |
| **IaC** | Terraform | สร้าง Kind cluster อัตโนมัติ |
| **Ingress** | Nginx | Route traffic เข้า services |
| **CI/CD** | GitHub Actions | Automate build, test, deploy |
| **Secret Scan** | Gitleaks | หา secrets ที่หลุดใน code |
| **SAST** | Bandit + CodeQL | Static code analysis |
| **Image Scan** | Trivy | หา CVE vulnerabilities ใน Docker image |
| **Metrics** | Prometheus | Collect และ store metrics |
| **Dashboard** | Grafana | Visualize metrics และ logs |
| **Logging** | Loki + Promtail | Collect และ query logs |

---

## 🔭 Observability Stack — คืออะไร ทำอะไร มีประโยชน์อะไร

Observability คือความสามารถในการ **"มองเห็นข้างใน"** ระบบที่กำลังรันอยู่  
ถ้าไม่มี observability = ระบบพังแล้วไม่รู้ว่าพังตรงไหน ทำไม และเมื่อไหร่

โปรเจคนี้ใช้ **PLG Stack** (Prometheus + Loki + Grafana)

---

### 📈 Prometheus — Metrics Collection

**คืออะไร?**  
Prometheus คือ open-source time-series database ที่ออกแบบมาเพื่อเก็บ metrics โดยเฉพาะ ทำงานโดยการ **scrape** (ดึงข้อมูล) จาก `/metrics` endpoint ของแต่ละ service ทุก 30 วินาที

**ในโปรเจคนี้ใช้ทำอะไร?**
- Scrape metrics จาก 3 microservices (order, product, user)
- เก็บ Kubernetes system metrics (CPU, Memory, Network, Pod restarts)
- เก็บ custom business metric `order_requests_total` ที่สร้างเองใน Go code
- ตรวจสอบว่า service ยัง UP หรือ DOWN ผ่าน Target Health page

**มีประโยชน์อะไร?**
- รู้ทันทีว่า service ไหน down โดยไม่ต้องรอ user report
- ดูได้ว่า traffic เพิ่มหรือลดตอนไหน (peak hours)
- ตั้ง alert เมื่อ metric เกิน threshold เช่น memory > 80%
- เก็บ historical data ย้อนหลังเพื่อวิเคราะห์ trend และ capacity planning

```promql
# ตัวอย่าง PromQL queries ที่ใช้บ่อย
order_requests_total                           # จำนวน requests สะสม
rate(order_requests_total[1m])                # requests ต่อวินาที
container_memory_working_set_bytes            # memory ที่ใช้อยู่
kube_pod_container_status_restarts_total      # จำนวน pod restarts
```

---

### 📊 Grafana — Visualization & Dashboard

**คืออะไร?**  
Grafana คือ open-source dashboard platform ที่ดึงข้อมูลจาก data source หลายแหล่ง (Prometheus, Loki, etc.) มาแสดงเป็นกราฟ gauge และ dashboard แบบ real-time

**ในโปรเจคนี้ใช้ทำอะไร?**
- แสดง CPU/Memory usage ของทุก pod แบบ real-time refresh ทุก 5 วินาที
- แสดง dashboard "Kubernetes / Views / Pods" ที่เห็น resource ทุก service
- ใช้ Explore mode เพื่อ query Prometheus metrics และ Loki logs ในที่เดียว
- เห็น spike ของ CPU/Memory ตอนทำ load test และ incident simulation

**มีประโยชน์อะไร?**
- เห็นภาพรวมระบบทั้งหมดในหน้าเดียว ไม่ต้อง kubectl หลาย commands
- ช่วยให้ทีม non-technical เข้าใจ system health ได้ง่าย
- ตั้ง alert และ notification ผ่าน Slack, Email, PagerDuty ได้
- เปรียบเทียบ metrics ระหว่าง services ได้ง่ายในกราฟเดียวกัน

```
Dashboard URL:
http://localhost:3001/d/k8s_views_pods/kubernetes-views-pods?var-namespace=forge-ops
```

---

### 📝 Loki — Log Aggregation

**คืออะไร?**  
Loki คือ log aggregation system จาก Grafana Labs ออกแบบให้ทำงานคู่กับ Prometheus โดย **ไม่ index เนื้อหา log** แต่ index เฉพาะ labels (namespace, pod, container) ทำให้ประหยัด storage มากกว่า ELK Stack ถึง 10 เท่า

**ในโปรเจคนี้ใช้ทำอะไร?**
- เก็บ logs จากทุก pod ใน namespace `forge-ops` แบบ centralized
- ใช้ค้นหา error logs เมื่อเกิด incident โดยไม่ต้อง kubectl logs ทีละ pod
- เห็น gap ของ logs เมื่อ pod crash แล้ว restart = evidence ของ incident
- filter logs ด้วย keyword เช่น "error", "404", "500"

**มีประโยชน์อะไร?**
- ไม่ต้อง `kubectl logs` ทีละ pod อีกต่อไป
- ค้นหา error ข้าม services ได้ในที่เดียว
- เก็บ logs ย้อนหลังแม้ pod จะถูกลบไปแล้ว (เช่น หลัง crash)
- ใช้ LogQL query language ที่ทรงพลัง คล้าย PromQL

```logql
# ตัวอย่าง LogQL queries
{namespace="forge-ops"}                            # logs ทุก service
{namespace="forge-ops", container="order-service"} # เฉพาะ order-service
{namespace="forge-ops"} |= "error"                # filter errors
{namespace="forge-ops"} |= "404"                  # filter 404s
{namespace="forge-ops"} |= "500"                  # filter 500s
```

---

### 🚚 Promtail — Log Collector (Agent)

**คืออะไร?**  
Promtail คือ log shipping agent ที่รันเป็น DaemonSet (ทุก node จะมี 1 pod) หน้าที่คือ **อ่าน log files จาก pods** แล้วส่งต่อให้ Loki พร้อม labels

**ในโปรเจคนี้ใช้ทำอะไร?**
- รันอยู่บนทุก node (3 nodes = 3 Promtail pods)
- อ่าน log จาก `/var/log/pods/forge-ops_*` บน host
- แนบ labels (namespace, pod, container, app, node) ก่อนส่งให้ Loki
- ติดตาม pod ใหม่ที่เกิดจาก scaling/restart อัตโนมัติ

**มีประโยชน์อะไร?**
- ไม่ต้องแก้ application code เพื่อ send logs (zero-code change)
- รองรับ log rotation อัตโนมัติ
- ทำงานแบบ push-based ส่ง logs ถึง Loki โดยตรง

---

### 🔗 ทำงานร่วมกันอย่างไร?

```
┌─────────────────────────────────────────────┐
│              forge-ops namespace             │
│  [order-service] [product-service] [user-service] │
│       │ stdout/stderr logs    │ /metrics     │
└───────┼───────────────────────┼─────────────┘
        │                       │
        ▼                       ▼
  [Promtail]              [Prometheus]
  อ่าน log files          scrape /metrics
  แนบ labels              ทุก 30 วินาที
        │                       │
        ▼                       ▼
     [Loki]               [Prometheus DB]
  เก็บ logs               เก็บ metrics
        │                       │
        └──────────┬────────────┘
                   ▼
              [Grafana]
         Dashboard + Explore
              │         │
         metrics      logs
         (PromQL)   (LogQL)
              │         │
              ▼         ▼
          Engineer เห็นทุกอย่างในที่เดียว
```

---

## 🚀 Microservices

### order-service (Go :8080)
- `GET /orders` — ดึง order ทั้งหมด
- `GET /health` — health check
- `GET /metrics` — Prometheus metrics (custom: `order_requests_total`)

### product-service (Node.js :3000)
- `GET /products` — ดึง product ทั้งหมด
- `GET /health` — health check
- `GET /metrics` — Prometheus metrics

### user-service (Python/FastAPI :8000)
- `GET /users` — ดึง user ทั้งหมด
- `GET /health` — health check
- `GET /metrics` — Prometheus metrics

---

## ⚙️ Prerequisites

```bash
docker
kubectl
kind
terraform
helm
```

---

## 🏃 How to Run

### 1. สร้าง Kubernetes Cluster
```bash
cd terraform
terraform init
terraform apply
```

### 2. Deploy Services
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/order-service/
kubectl apply -f k8s/product-service/
kubectl apply -f k8s/user-service/
kubectl apply -f k8s/ingress.yaml
```

### 3. Install Observability Stack
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Prometheus + Grafana
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
  --namespace observability --create-namespace \
  -f observability/values-prometheus.yaml

# Loki
helm upgrade --install loki grafana/loki \
  --namespace observability \
  -f observability/values-loki.yaml

# Promtail
helm upgrade --install promtail grafana/promtail \
  --namespace observability \
  -f observability/values-promtail.yaml
```

### 4. Port Forward
```bash
kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n observability
kubectl port-forward svc/grafana 3001:3000 -n observability
kubectl port-forward svc/loki 3100:3100 -n observability
kubectl port-forward svc/ingress-nginx-controller 80:80 -n ingress-nginx
```

### 5. Test Endpoints
```bash
curl -H "Host: forge-ops.local" http://localhost/orders
curl -H "Host: forge-ops.local" http://localhost/products
curl -H "Host: forge-ops.local" http://localhost/users
```

---

## 🧪 How to Test

### Unit Tests
```bash
# user-service (Python)
cd services/user-service
pip install -r requirements.txt pytest pytest-asyncio httpx
pytest -v

# product-service (Node.js)
cd services/product-service
npm ci && npm test

# order-service (Go)
cd services/order-service
go test ./... -v
```

### Load Test
```bash
# PowerShell — burst แล้วหยุด สลับกัน เพื่อดู spike ใน Grafana
while ($true) {
    1..20 | ForEach-Object -Parallel {
        curl -H "Host: forge-ops.local" http://localhost/orders
        curl -H "Host: forge-ops.local" http://localhost/products
        curl -H "Host: forge-ops.local" http://localhost/users
    } -ThrottleLimit 20
    Start-Sleep -Milliseconds 500
}
```

---

## 🔒 CI/CD Pipeline

Pipeline รันอัตโนมัติทุกครั้งที่ push ขึ้น `main` branch:

```
Stage 1: Secret Scan    → Gitleaks
Stage 2: SAST           → Bandit (Python) + CodeQL (Python/JS)
Stage 3: Unit Test      → pytest + npm test + go test
Stage 4: Build & Push   → Docker image → DockerHub (tagged with git SHA)
Stage 5: Image Scan     → Trivy (CRITICAL, HIGH CVEs)
Stage 6: Deploy         → kubectl set image
```

### GitHub Secrets ที่ต้องตั้ง
```
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
```

---

## 📊 Monitoring URLs

| URL | ใช้ทำอะไร |
|-----|-----------|
| http://localhost:9090 | Prometheus UI |
| http://localhost:9090/targets | ดู scrape targets status |
| http://localhost:3001 | Grafana dashboard |
| http://localhost:3001/explore | Query logs (Loki) + metrics |

---

## 📖 Incident Response

ดู [docs/runbook.md](docs/runbook.md) สำหรับ step-by-step incident response

| Incident | Detection | Recovery Time |
|----------|-----------|---------------|
| Pod Crash | Grafana gap + Loki logs หยุด | ~9 วินาที (K8s self-heal) |
| High Memory | Prometheus memory spike | Scale up replicas |
| Service Down | 503 + Prometheus target DOWN | Scale replicas back |
| 500/404 Errors | Loki log filter | Fix code + redeploy |

---

## 👨‍💻 Author

**Saranphat** — Computer Engineering Student  
Interested in Cloud, DevOps, and Platform Engineering
