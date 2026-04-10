# 🔍 Observability Stack - Recheck & Testing Guide

## ✅ สถานะการติดตั้งปัจจุบัน

### ติดตั้งแล้ว:
- ✅ Namespace: `observability` 
- ✅ **Prometheus** (kube-prometheus-stack) - รันอยู่ 17 ชั่วโมง
- ✅ **Loki** - รันอยู่ 5 ชั่วโมง  
- ✅ **Grafana** - รันอยู่ 17 ชั่วโมง
- ✅ Alertmanager
- ✅ Node Exporter (3 pods)
- ✅ Services ทั้งหมด (user, product, order) - รันอยู่ใน namespace `forge-ops`

### ยังไม่ได้ติดตั้ง:
- ❌ **Promtail** (ไม่เห็นใน helm list และไม่มี daemonset)

---

## 📋 ขั้นตอนการทดสอบทีละอย่าง

### 1️⃣ ติดตั้ง Promtail (ขั้นแรก)

```bash
# ติดตั้ง Promtail
helm install promtail grafana/promtail \
  --set config.clients[0].url=http://loki.observability.svc.cluster.local:3100/loki/api/v1/push \
  -n observability

# เช็คว่าติดตั้งสำเร็จ
kubectl get pods -n observability | grep promtail
kubectl get daemonset -n observability
```

**ผลลัพธ์ที่คาดหวัง:**
- ควรเห็น promtail pods รันอยู่ทุก node (3 pods สำหรับ 3 nodes)
- Status: Running

---

### 2️⃣ ทดสอบ Prometheus

```bash
# Port forward Prometheus UI
kubectl port-forward -n observability svc/prometheus-kube-prometheus-prometheus 9090:9090

# เปิดบราวเซอร์: http://localhost:9090
```

**การทดสอบใน Prometheus:**

1. **ทดสอบ Query พื้นฐาน:**
   ```promql
   up
   ```
   ✅ ควรเห็น targets ที่ up = 1

2. **ทดสอบ Metrics จาก Services:**
   ```promql
   up{job=~"forge-ops.*"}
   ```
   ✅ ควรเห็น user-service, product-service, order-service

3. **ทดสอบ Node Metrics:**
   ```promql
   node_memory_MemAvailable_bytes
   ```
   ✅ ควรเห็น memory ของแต่ละ node

4. **ดู Targets:**
   - ไปที่ Status > Targets
   - ✅ ตรวจสอบว่า targets ทั้งหมดเป็น "UP" สีเขียว

---

### 3️⃣ ทดสอบ Loki

```bash
# Port forward Loki
kubectl port-forward -n observability svc/loki 3100:3100

# ทดสอบ Loki API
curl http://localhost:3100/ready
```

**ผลลัพธ์ที่คาดหวัง:**
```
ready
```

**ทดสอบ Query Logs:**
```bash
# ดู labels ทั้งหมด
curl http://localhost:3100/loki/api/v1/labels

# Query logs
curl -G http://localhost:3100/loki/api/v1/query_range \
  --data-urlencode 'query={namespace="observability"}' \
  --data-urlencode 'limit=10'
```

---

### 4️⃣ ทดสอบ Grafana

```bash
# Port forward Grafana
kubectl port-forward -n observability svc/grafana 3000:3000

# เปิดบราวเซอร์: http://localhost:3000
```

**Login Credentials:**
- Username: `admin`
- Password: `admin123`

**การทดสอบใน Grafana:**

#### A. ทดสอบ Prometheus Datasource

1. ไปที่: **Connections > Data sources > Prometheus**
2. คลิก **"Test"** ด้านล่าง
3. ✅ ควรเห็น "Successfully queried the Prometheus API" สีเขียว

4. ไปที่ **Explore**
5. เลือก Datasource: **Prometheus**
6. Query:
   ```promql
   rate(container_cpu_usage_seconds_total[5m])
   ```
7. ✅ ควรเห็นกราฟ CPU usage

#### B. ทดสอบ Loki Datasource

1. ไปที่: **Connections > Data sources > Loki**
2. คลิก **"Test"** ด้านล่าง
3. ✅ ควรเห็น "Data source successfully connected" สีเขียว

4. ไปที่ **Explore**
5. เลือก Datasource: **Loki**
6. Query:
   ```logql
   {namespace="observability"}
   ```
7. ✅ ควรเห็น logs จาก observability namespace

8. Query logs จาก services:
   ```logql
   {namespace="forge-ops"}
   ```
9. ✅ ควรเห็น logs จาก user-service, product-service, order-service

---

### 5️⃣ ทดสอบ End-to-End Flow

#### A. สร้าง Traffic ไปยัง Services

```bash
# ทดสอบ User Service
curl http://localhost/user-service/health
curl http://localhost/user-service/metrics

# ทดสอบ Product Service  
curl http://localhost/product-service/health
curl http://localhost/product-service/metrics

# ทดสอบ Order Service
curl http://localhost/order-service/health
curl http://localhost/order-service/metrics

# สร้าง traffic หลายๆ ครั้ง
for i in {1..20}; do curl http://localhost/user-service/health; done
```

#### B. ตรวจสอบ Metrics ใน Grafana

1. เปิด Grafana Explore (Prometheus)
2. Query:
   ```promql
   rate(http_requests_total[5m])
   ```
3. ✅ ควรเห็นกราฟเพิ่มขึ้นหลังส่ง traffic

#### C. ตรวจสอบ Logs ใน Grafana

1. เปิด Grafana Explore (Loki)
2. Query:
   ```logql
   {namespace="forge-ops"} |= "health"
   ```
3. ✅ ควรเห็น log entries ของ health check requests

---

### 6️⃣ Import Dashboards

```bash
# ใน Grafana UI:
# Dashboards > Import > ใส่ ID

# 1. Kubernetes Cluster Monitoring
ID: 15757

# 2. Node Exporter Full  
ID: 1860

# 3. Loki Dashboard
ID: 13639

# 4. NGINX Ingress Controller
ID: 9614
```

**หลังจาก Import:**
- ✅ ควรเห็นข้อมูลแสดงในแต่ละ dashboard
- ✅ ไม่มี error "No data"

---

### 7️⃣ ทดสอบ Alertmanager (Optional)

```bash
# Port forward Alertmanager
kubectl port-forward -n observability svc/prometheus-kube-prometheus-alertmanager 9093:9093

# เปิดบราวเซอร์: http://localhost:9093
```

**การทดสอบ:**
- ✅ เข้า UI ได้
- ✅ ดู Alerts ที่มีอยู่ (ถ้ามี)
- ✅ ดู Silences และ Configuration

---

## 🔍 คำสั่งตรวจสอบสถานะ

### เช็คทุกอย่างในครั้งเดียว

```bash
# เช็ค Helm releases
helm list -n observability

# เช็ค Pods
kubectl get pods -n observability

# เช็ค Services  
kubectl get svc -n observability

# เช็ค DaemonSets
kubectl get daemonset -n observability

# เช็ค Services ที่ต้อง monitor
kubectl get pods -n forge-ops

# เช็ค Logs
kubectl logs -n observability deployment/grafana --tail=50
kubectl logs -n observability deployment/loki --tail=50
kubectl logs -n observability deployment/prometheus-kube-prometheus-operator --tail=50
```

### เช็คว่า Prometheus Scrape ได้

```bash
# ดู ServiceMonitors
kubectl get servicemonitor -A

# ดู PodMonitors  
kubectl get podmonitor -A

# ดู Targets ใน Prometheus
# เปิด http://localhost:9090/targets
```

---

## ⚠️ Troubleshooting

### ถ้า Grafana ไม่แสดงข้อมูล

```bash
# เช็ค datasource configuration
kubectl get configmap -n observability grafana -o yaml | grep -A 20 datasources

# Restart Grafana
kubectl rollout restart deployment/grafana -n observability
```

### ถ้า Loki ไม่ได้รับ Logs

```bash
# เช็คว่า Promtail ส่งได้
kubectl logs -n observability daemonset/promtail --tail=100

# เช็คว่า Loki รับได้
kubectl logs -n observability deployment/loki --tail=100

# ทดสอบ connectivity
kubectl exec -n observability deployment/promtail -- wget -O- http://loki.observability.svc.cluster.local:3100/ready
```

### ถ้า Prometheus ไม่ Scrape Metrics

```bash
# เช็ค Prometheus config
kubectl get prometheus -n observability -o yaml

# ดู logs ของ Prometheus
kubectl logs -n observability prometheus-prometheus-kube-prometheus-prometheus-0 -c prometheus

# เช็ค Network Policy
kubectl get networkpolicy -A
```

---

## ✅ Checklist สรุป

- [ ] Promtail ติดตั้งและรันได้
- [ ] Prometheus UI เปิดได้ และมี targets ที่ UP
- [ ] Loki API respond ได้ (curl /ready)
- [ ] Grafana login ได้
- [ ] Prometheus datasource test สำเร็จ
- [ ] Loki datasource test สำเร็จ
- [ ] Query metrics ใน Grafana Explore ได้
- [ ] Query logs ใน Grafana Explore ได้
- [ ] เห็น logs จาก forge-ops services
- [ ] Import dashboards สำเร็จและมีข้อมูล
- [ ] สร้าง traffic แล้วเห็นใน metrics และ logs

---

## 📚 References

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (admin/admin123)
- Alertmanager: http://localhost:9093
- Loki: http://localhost:3100

**Next Step:** Step 8 - Troubleshoot + Incident Response Runbook
