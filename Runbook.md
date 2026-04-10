# 📘 Incident Response Runbook
> **Project:** DevSecOps Lab — forge-ops  
> **Stack:** Kubernetes (Kind) + Prometheus + Grafana + Loki  
> **Namespace:** `forge-ops` | Observability: `observability`

---

## 🚀 Quick Reference — Boot Up

```bash
# 1. เช็ค cluster
kind get clusters
kubectl get nodes

# 2. เช็ค pods
kubectl get pods -n forge-ops
kubectl get pods -n observability

# 3. Port-forwards (เปิดทีละ terminal)
kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n observability
kubectl port-forward svc/grafana 3001:3000 -n observability
kubectl port-forward svc/loki 3100:3100 -n observability
kubectl port-forward svc/ingress-nginx-controller 80:80 -n ingress-nginx
```

| URL | ใช้ทำอะไร |
|-----|-----------|
| http://localhost:9090/targets | Prometheus targets |
| http://localhost:3001 | Grafana dashboard |
| http://localhost:3001/explore | Loki logs |

---

## 🔴 Incident 1 — Pod Crash / CrashLoopBackOff

### Symptoms
- Pod status: `CrashLoopBackOff` หรือ `Error`
- Grafana: CPU/Memory หายไปแล้วกลับมา
- Loki: logs หยุดแล้วกลับมา

### Detect
```bash
kubectl get pods -n forge-ops
kubectl describe pod <pod-name> -n forge-ops | grep -A5 "Last State"
kubectl logs <pod-name> -n forge-ops --previous
```

### Investigate
```bash
# ดู events
kubectl get events -n forge-ops --sort-by='.lastTimestamp'

# เช็ค resource limits
kubectl describe pod <pod-name> -n forge-ops | grep -A3 "Limits"
```

### Fix
```bash
# Restart deployment
kubectl rollout restart deployment/<service-name> -n forge-ops

# ถ้า OOMKilled — เพิ่ม memory limit ใน deployment.yaml
# resources:
#   limits:
#     memory: "512Mi"  # เพิ่มจาก 256Mi
kubectl apply -f k8s/<service>/deployment.yaml
```

### Expected Recovery Time
~9 วินาที (K8s self-heal)

---

## 🔴 Incident 2 — High Memory / CPU Usage

### Symptoms
- Grafana: Memory/CPU gauge สูงผิดปกติ
- Pod อาจถูก OOMKilled

### Detect
```bash
# Prometheus query
container_memory_working_set_bytes{namespace="forge-ops"}
rate(container_cpu_usage_seconds_total{namespace="forge-ops"}[1m])

# kubectl
kubectl top pods -n forge-ops
```

### Loki Query
```logql
{namespace="forge-ops"} |= "error"
{namespace="forge-ops"} |= "OOM"
```

### Investigate
```bash
kubectl describe pod <pod-name> -n forge-ops | grep -A5 "OOMKilled"
kubectl get hpa -n forge-ops  # ถ้ามี autoscaler
```

### Fix
```bash
# Scale up replicas ชั่วคราว
kubectl scale deployment/<service-name> --replicas=3 -n forge-ops

# หรือเพิ่ม resource limits
kubectl edit deployment/<service-name> -n forge-ops
```

---

## 🔴 Incident 3 — Service Down (503)

### Symptoms
- curl ได้ `503 Service Unavailable`
- Prometheus target: **DOWN**
- Loki: logs หยุด

### Detect
```bash
# เช็ค pods
kubectl get pods -n forge-ops

# เช็ค Prometheus targets
# http://localhost:9090/targets

# ทดสอบ endpoint
curl -H "Host: forge-ops.local" http://localhost/orders
curl -H "Host: forge-ops.local" http://localhost/health
```

### Investigate
```bash
kubectl describe deployment/<service-name> -n forge-ops
kubectl get events -n forge-ops --sort-by='.lastTimestamp'
kubectl logs -l app=<service-name> -n forge-ops --tail=50
```

### Fix
```bash
# ถ้า replicas = 0
kubectl scale deployment/<service-name> --replicas=2 -n forge-ops

# ถ้า image ผิด
kubectl set image deployment/<service-name> \
  <service-name>=forge-ops/<service-name>:v2 -n forge-ops

# รอ rollout
kubectl rollout status deployment/<service-name> -n forge-ops
```

### Verify
```bash
# ต้องได้ JSON response
curl -H "Host: forge-ops.local" http://localhost/orders
```

---

## 🔴 Incident 4 — 500 / 404 Errors

### Symptoms
- Response: `404 Not Found` หรือ `500 Internal Server Error`
- Service ยัง UP แต่ request fail

### Detect
```logql
# Loki queries
{namespace="forge-ops"} |= "404"
{namespace="forge-ops"} |= "500"
{namespace="forge-ops"} |= "error"
```

```bash
# Prometheus — ดู error rate
rate(http_requests_total{status=~"5.."}[5m])
```

### Investigate
```bash
# ดู application logs
kubectl logs -l app=order-service -n forge-ops --tail=100
kubectl logs -l app=product-service -n forge-ops --tail=100
kubectl logs -l app=user-service -n forge-ops --tail=100

# ทดสอบ health endpoint
kubectl exec -it deployment/order-service -n forge-ops -- wget -qO- http://localhost:8080/health
```

### Fix
```bash
# Rebuild image ถ้ามี bug ใน code
docker build --no-cache -t forge-ops/<service-name>:v3 ./services/<service-name>
kind load docker-image forge-ops/<service-name>:v3 --name forge-ops
kubectl set image deployment/<service-name> \
  <service-name>=forge-ops/<service-name>:v3 -n forge-ops
```

---

## 🔧 Useful Commands

```bash
# ดู logs real-time
kubectl logs -f deployment/order-service -n forge-ops

# exec เข้า pod
kubectl exec -it deployment/order-service -n forge-ops -- sh

# ดู resource usage
kubectl top pods -n forge-ops
kubectl top nodes

# rollback deployment
kubectl rollout undo deployment/<service-name> -n forge-ops
kubectl rollout history deployment/<service-name> -n forge-ops

# เช็ค service endpoints
kubectl get endpoints -n forge-ops
```

---

## 📊 Monitoring Queries

### Prometheus
```promql
# Request rate
rate(order_requests_total[1m])

# Memory usage
container_memory_working_set_bytes{namespace="forge-ops"}

# CPU usage
rate(container_cpu_usage_seconds_total{namespace="forge-ops"}[1m])

# Pod restarts
kube_pod_container_status_restarts_total{namespace="forge-ops"}
```

### Loki
```logql
# ดู logs ทุก service
{namespace="forge-ops"}

# filter เฉพาะ service
{namespace="forge-ops", container="order-service"}

# filter errors
{namespace="forge-ops"} |= "error"

# filter HTTP status
{namespace="forge-ops"} |= "500"
{namespace="forge-ops"} |= "404"
```
### ReScale
```Recovery — scale
#  
kubectl scale deployment order-service --replicas=2 -n forge-ops
kubectl get pods -n forge-ops -w
```
