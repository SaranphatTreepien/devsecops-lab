# Incident Response Runbook — forge-ops

## User Service Down

### Symptoms
- Alert: UserServiceErrorBudgetCritical
- `/users` endpoint ไม่ตอบสนอง

### Steps
1. เช็ค pod status
   kubectl get pods -n forge-ops -l app=user-service

2. ดู logs
   kubectl logs -n forge-ops -l app=user-service --tail=50

3. เช็ค resource
   kubectl top pods -n forge-ops

4. Restart ถ้าจำเป็น
   kubectl rollout restart deployment/user-service -n forge-ops

5. ตรวจสอบ
   curl http://forge-ops.local:8888/users

### SLO
- Target: 99.9% uptime
- Error budget: 0.1% (~43 min/month)

---

## Product Service Down

### Symptoms
- Alert: ProductServiceErrorBudgetWarning
- `/products` endpoint response time สูง

### Steps
1. kubectl get pods -n forge-ops -l app=product-service
2. kubectl logs -n forge-ops -l app=product-service --tail=50
3. kubectl rollout restart deployment/product-service -n forge-ops

### SLO
- Target: 99.9% uptime

---

## Order Service Down

### Symptoms
- Alert: OrderServiceErrorBudgetWarning
- `/orders` endpoint error rate สูง

### Steps
1. kubectl get pods -n forge-ops -l app=order-service
2. kubectl logs -n forge-ops -l app=order-service --tail=50
3. kubectl rollout restart deployment/order-service -n forge-ops

### SLO
- Target: 99.5% uptime
- Error budget: 0.5% (~3.6 hr/month)