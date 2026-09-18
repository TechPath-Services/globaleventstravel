# Workspace-Level Agent Rules

This file provides workspace-level guidance for AI coding agents (Antigravity, Claude, Codex) working in this monorepo.

> For the complete project context, read the root `AGENTS.md` first.

## Workflow

1. **Before making changes**: Read `AGENTS.md` for architecture, conventions, and environment setup.
2. **Use the Makefile**: All common operations are available via `make <target>`. Run `make help` to see options.
3. **After making changes**: Always run `make preflight` to verify lint, test, and build pass. Do not declare work complete until preflight passes.
4. **Documentation**: If you change architecture or add new features, update the relevant file in `docs/`.

## Quick Reference

| Task | Command |
|------|---------|
| Install all deps | `make setup` |
| Start dev servers | `make dev` |
| Lint everything | `make lint` |
| Run tests | `make test` |
| Format backend | `make format` |
| Build for production | `make build` |
| Full quality gate | `make preflight` |
| Reset DB | `make db-reset` |
| Run migrations | `make db-migrate` |

## Key Directories

- `scripts/` — Automation scripts (setup, preflight, db-reset)
- `docs/` — All project documentation (architecture, deployment, design system, etc.)
- `.agents/` — Agent customizations (this directory)
- `.github/workflows/` — CI/CD pipelines

## Rules for Agents

1. Never modify CI/CD workflows without explicit user approval.
2. Never commit `.env`, `.env.local`, or any file containing secrets.
3. Always run `make preflight` after making code changes.
4. Follow the coding standards defined in `.agents/rules/coding-standards.md`.
5. Follow the testing policy defined in `.agents/rules/testing-policy.md`.
