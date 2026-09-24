# =============================================================================
# Global Events Travels — Monorepo Makefile
# Usage: make <target>  |  make help
# =============================================================================

.DEFAULT_GOAL := help
SHELL := /bin/bash

# Ensure pyenv + Poetry are on PATH for all targets
export PYENV_ROOT := $(HOME)/.pyenv
export PATH := $(PYENV_ROOT)/bin:$(PYENV_ROOT)/shims:$(HOME)/.local/bin:$(PATH)

# =============================================================================
# Installation / Setup
# =============================================================================

.PHONY: setup
setup: ## First-time local setup (install all deps, copy env samples)
	@bash scripts/setup.sh

.PHONY: install
install: ## Install dependencies for all sub-projects
	cd backend && poetry config virtualenvs.in-project true && poetry env use python3 && poetry install --no-interaction
	cd frontend && npm install
	cd admin && npm install
	@echo "✓ All dependencies installed"

# =============================================================================
# Local Dev Runner (cross-platform logging)
# Starts background services and logs output to .dev/
# =============================================================================

.PHONY: dev
dev: ## Start all dev servers (backend + frontend + admin)
	@bash scripts/dev_up.sh

.PHONY: dev-service
dev-service: ## Start one service: make dev-service s=backend
	@bash scripts/dev_up.sh $(s)

.PHONY: dev-stop
dev-stop: ## Stop all running dev services
	@bash scripts/dev_down.sh

# Individual interactive targets for convenience
.PHONY: run-backend
run-backend: ## Run backend in foreground
	cd backend && poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

.PHONY: run-frontend
run-frontend: ## Run frontend in foreground
	cd frontend && npm run dev

.PHONY: run-admin
run-admin: ## Run admin in foreground
	cd admin && npm run dev

# =============================================================================
# Code Quality / Preflight
# =============================================================================

.PHONY: preflight
preflight: ## Run full quality gate (lint + test + build) — REQUIRED before commit
	@bash scripts/preflight.sh

.PHONY: lint
lint: lint-backend lint-frontend lint-admin ## Run linters on all sub-projects

.PHONY: lint-backend
lint-backend:
	cd backend && poetry run flake8 app/ --max-line-length=100 --exclude=__pycache__,migrations

.PHONY: lint-frontend
lint-frontend:
	cd frontend && npm run check

.PHONY: lint-admin
lint-admin:
	cd admin && npm run lint

.PHONY: format
format: ## Auto-format backend code (black + isort)
	cd backend && poetry run black app/ && poetry run isort app/
	@echo "✓ Backend formatted"

.PHONY: typecheck
typecheck: ## Run type checks
	cd backend && poetry run mypy app/
	cd frontend && npm run check

# =============================================================================
# Testing
# =============================================================================

.PHONY: test
test: test-backend ## Run tests on all sub-projects

.PHONY: test-backend
test-backend: ## Run backend tests
	cd backend && poetry run pytest --tb=short -q

# =============================================================================
# Build
# =============================================================================

.PHONY: build
build: build-frontend build-admin ## Build frontend + admin for production

.PHONY: build-frontend
build-frontend:
	cd frontend && npm run build

.PHONY: build-admin
build-admin:
	cd admin && npm run build

# =============================================================================
# Database
# =============================================================================

.PHONY: db-reset
db-reset: ## Reset and reseed the backend database
	@bash scripts/db-reset.sh

.PHONY: db-seed
db-seed: ## Seed the backend database (without reset)
	cd backend && poetry run seed

.PHONY: db-migrate
db-migrate: ## Run Alembic migrations (upgrade head)
	cd backend && poetry run alembic upgrade head

.PHONY: db-migration
db-migration: ## Create new Alembic migration (usage: make db-migration MSG="description")
	cd backend && poetry run alembic revision --autogenerate -m "$(MSG)"

# =============================================================================
# Utilities
# =============================================================================

.PHONY: sync-reviews
sync-reviews: ## Sync Google reviews from Places API
	cd backend && poetry run sync-google-reviews

.PHONY: clean
clean: ## Remove build artifacts and caches
	@echo "Cleaning build artifacts..."
	rm -rf frontend/dist frontend/.astro
	rm -rf admin/.next admin/out
	rm -rf backend/.pytest_cache backend/.mypy_cache
	find backend -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	@echo "✓ Clean complete"

.PHONY: help
help: ## Show this help message
	@echo ""
	@echo "Global Events Travels — Available Commands"
	@echo "============================================================================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""
