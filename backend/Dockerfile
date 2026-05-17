FROM golang:1.25-alpine AS deps
RUN apk add --no-cache git
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

FROM golang:1.25-alpine AS builder
WORKDIR /app
COPY --from=deps /go/pkg /go/pkg
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -tags migrate -o bin/app ./cmd/app

FROM alpine:3.21
RUN apk add --no-cache ca-certificates tzdata wget && \
    addgroup -S app && adduser -S app -G app

WORKDIR /app
COPY --from=builder /app/bin/app .
COPY --from=builder /app/migrations ./migrations
RUN chown -R app:app /app

USER app
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:8080/healthz || exit 1

CMD ["./app"]
