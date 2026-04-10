package main

import (
    "encoding/json"
    "net/http"

    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promauto"
    "github.com/prometheus/client_golang/prometheus/promhttp"
)

var orderRequests = promauto.NewCounter(prometheus.CounterOpts{
    Name: "order_requests_total",
    Help: "Total number of order requests",
})

func healthHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{
        "status": "ok", "service": "order-service",
    })
}

func ordersHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    orderRequests.Inc()
    orders := []map[string]interface{}{
        {"id": 1, "product_id": 1, "qty": 2},
        {"id": 2, "product_id": 2, "qty": 1},
    }
    json.NewEncoder(w).Encode(orders)
}

func main() {
    http.HandleFunc("/health", healthHandler)
    http.HandleFunc("/orders", ordersHandler)
    http.Handle("/metrics", promhttp.Handler())
    http.ListenAndServe(":8080", nil)
}