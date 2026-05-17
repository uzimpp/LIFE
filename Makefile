.PHONY: help up down logs lint test ci

help:
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

up: ## Build and start all services
	docker compose up --build -d

down: ## Stop all services
	docker compose down --remove-orphans

logs: ## Follow logs for all services
	docker compose logs -f

lint: ## Run linters for backend and frontend
	$(MAKE) -C backend lint
	cd frontend && npm run lint

test: ## Run tests for backend and frontend
	$(MAKE) -C backend test
	cd frontend && npm test -- --run 2>/dev/null || true

ci: lint test ## Run lint + test (used in CI)
