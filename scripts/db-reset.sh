#!/usr/bin/env bash
# =============================================================================
# scripts/db-reset.sh — Reset and reseed the backend database
# Usage: make db-reset
# =============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# ── Color helpers ────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info() { echo -e "${CYAN}ℹ ${NC} $*"; }
ok()   { echo -e "${GREEN}✔ ${NC} $*"; }
warn() { echo -e "${YELLOW}⚠ ${NC} $*"; }

cd "$ROOT_DIR/backend"

# Remove existing SQLite database
if [[ -f data/app.db ]]; then
  rm data/app.db
  ok "Removed data/app.db"
else
  warn "No existing database found at data/app.db"
fi

# Ensure data directory exists
mkdir -p data

# Reseed
info "Running database seed..."
poetry run seed

echo ""
ok "Database reset and seeded successfully!"
