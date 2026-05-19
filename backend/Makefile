.PHONY: help compose-up compose-down deps run build test lint migrate-create migrate-up swagger docker-rm-volume bin-deps clean clean-all

help:
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

compose-up: ## Run docker compose
	docker compose up --build -d

compose-down: ## Down docker compose
	docker compose down --remove-orphans

deps: ## tidy + verify
	go mod tidy && go mod verify

run: ## run with migrations
	go run -tags migrate ./cmd/app

build: ## build binary
	CGO_ENABLED=0 go build -o bin/app ./cmd/app

test: ## run unit tests
	go test -v -timeout 60s ./internal/... ./pkg/...

lint: ## lint code
	golangci-lint run

migrate-create: ## create migration (usage: make migrate-create NAME=create_foo)
	migrate create -ext sql -dir migrations $(NAME)

migrate-up: ## run migrations up
	migrate -path migrations -database '$(PG_URL)?sslmode=disable' up

swagger: ## generate swagger docs
	swag init -g internal/controller/http/v1/route.go -o docs

docker-rm-volume: ## remove docker volume
	docker volume rm life_pg-data

bin-deps: ## install tools
	go install github.com/golang-migrate/migrate/v4/cmd/migrate@latest
	go install github.com/swaggo/swag/cmd/swag@latest
	go install github.com/golangci/golangci-lint/v2/cmd/golangci-lint@v2.12.2
	go install github.com/air-verse/air@latest

clean:
	rm -rf bin/

clean-all:
	rm -rf bin/ && docker compose down -v
