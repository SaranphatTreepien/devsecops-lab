# Stage 1: Build
FROM golang:1.25-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
COPY main.go .
RUN go build -o order-service main.go

# Stage 2: Runtime (distroless — image เล็กมาก)
FROM alpine:3.19 AS runtime
WORKDIR /app
COPY --from=builder /app/order-service .
EXPOSE 8080
CMD ["./order-service"]
