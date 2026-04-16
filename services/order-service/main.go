package main

import (
    "context"
    "encoding/json"
    "net/http"
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promauto"
    "github.com/prometheus/client_golang/prometheus/promhttp"
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
    "go.opentelemetry.io/otel/sdk/resource"
    "go.opentelemetry.io/otel/sdk/trace"
    semconv "go.opentelemetry.io/otel/semconv/v1.4.0"
    "google.golang.org/grpc"
    "google.golang.org/grpc/credentials/insecure"
)

var orderRequests = promauto.NewCounter(prometheus.CounterOpts{
    Name: "order_requests_total",
    Help: "Total number of order requests",
})

func initTracer() {
    conn, _ := grpc.NewClient("tempo.observability.svc.cluster.local:4317", grpc.WithTransportCredentials(insecure.NewCredentials()))
    exporter, _ := otlptracegrpc.New(context.Background(), otlptracegrpc.WithGRPCConn(conn))
    res, _ := resource.New(context.Background(), resource.WithAttributes(semconv.ServiceNameKey.String("order-service")))
    tp := trace.NewTracerProvider(trace.WithBatcher(exporter), trace.WithResource(res))
    otel.SetTracerProvider(tp)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{"status": "ok", "service": "order-service"})
}

func ordersHandler(w http.ResponseWriter, r *http.Request) {
    tracer := otel.Tracer("order-service")
    _, span := tracer.Start(r.Context(), "get-orders")
    defer span.End()
    w.Header().Set("Content-Type", "application/json")
    orderRequests.Inc()
    orders := []map[string]interface{}{
        {"id": 1, "product_id": 1, "qty": 2},
        {"id": 2, "product_id": 2, "qty": 1},
    }
    json.NewEncoder(w).Encode(orders)
}

func main() {
    initTracer()
    http.HandleFunc("/health", healthHandler)
    http.HandleFunc("/orders", ordersHandler)
    http.Handle("/metrics", promhttp.Handler())
    http.ListenAndServe(":8080", nil)
}