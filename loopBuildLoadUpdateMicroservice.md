cd "C:\Kubernetes_Lab\devsecops-lab 2"

docker build -t forge-ops/user-service:v4 ./services/user-service
docker build -t forge-ops/product-service:v4 ./services/product-service
docker build -t forge-ops/order-service:v4 ./services/order-service

kind load docker-image forge-ops/user-service:v4 --name forge-ops
kind load docker-image forge-ops/product-service:v4 --name forge-ops
kind load docker-image forge-ops/order-service:v4 --name forge-ops

kubectl set image deployment/user-service user-service=forge-ops/user-service:v4 -n forge-ops
kubectl set image deployment/product-service product-service=forge-ops/product-service:v4 -n forge-ops
kubectl set image deployment/order-service order-service=forge-ops/order-service:v4 -n forge-ops