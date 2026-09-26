# Proxy to monorepo root Makefile (so `make dev-stop` works from backend/)
ROOT := $(abspath ..)

.DEFAULT_GOAL := help

.PHONY: help dev dev-stop run-backend db-seed db-reset preflight lint format

help:
	@$(MAKE) -C $(ROOT) help

dev:
	@$(MAKE) -C $(ROOT) dev

dev-stop:
	@$(MAKE) -C $(ROOT) dev-stop

run-backend:
	@$(MAKE) -C $(ROOT) run-backend

db-seed:
	@$(MAKE) -C $(ROOT) db-seed

db-reset:
	@$(MAKE) -C $(ROOT) db-reset

preflight:
	@$(MAKE) -C $(ROOT) preflight

lint:
	@$(MAKE) -C $(ROOT) lint-backend

format:
	@$(MAKE) -C $(ROOT) format
