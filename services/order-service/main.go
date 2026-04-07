package main

import (
    "encoding/json"
    "net/http"
)

func healthHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{
        "status": "ok", "service": "order-service",
    })
}

func ordersHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    orders := []map[string]interface{}{
        {"id": 1, "product_id": 1, "qty": 2},
        {"id": 2, "product_id": 2, "qty": 1},
    }
    json.NewEncoder(w).Encode(orders)
}

func main() {
    http.HandleFunc("/health", healthHandler)
    http.HandleFunc("/orders", ordersHandler)
    http.ListenAndServe(":8080", nil)
}