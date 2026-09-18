#!/usr/bin/env bash
# =============================================================================
# scripts/preflight.sh — Quality gate: lint + test + build
# Run before every commit or PR. Agents MUST run this after making changes.
# Usage: make preflight
# =============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
FAILED=0

# ── Color helpers ────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()   { echo -e "${CYAN}ℹ ${NC} $*"; }
ok()     { echo -e "${GREEN}✔ ${NC} $*"; }
warn()   { echo -e "${YELLOW}⚠ ${NC} $* (skipped)"; }
err()    { echo -e "${RED}✖  $*${NC}"; FAILED=1; }
header() { echo -e "\n${CYAN}━━━ $* ━━━${NC}"; }

# ── Backend Checks ───────────────────────────────────────────────
header "Backend (Python)"
cd "$ROOT_DIR/backend"

if command -v poetry >/dev/null 2>&1 && [[ -f pyproject.toml ]]; then
  # Format check
  if poetry run black --check --quiet app/ 2>/dev/null; then
    ok "black (format)"
  else
    err "black (format) — run: make format"
  fi

  # Import sort check
  if poetry run isort --check-only --quiet app/ 2>/dev/null; then
    ok "isort (imports)"
  else
    err "isort (imports) — run: make format"
  fi

  # Lint
  if poetry run flake8 app/ --max-line-length=100 --exclude=__pycache__,migrations 2>/dev/null; then
    ok "flake8 (lint)"
  else
    err "flake8 (lint)"
  fi

  # Tests
  if [[ -d tests ]] && find tests -name "test_*.py" -o -name "*_test.py" 2>/dev/null | grep -q .; then
    if poetry run pytest --tb=short -q 2>/dev/null; then
      ok "pytest"
    else
      err "pytest"
    fi
  else
    warn "pytest — no test files found in backend/tests/"
  fi
else
  warn "Backend — poetry or pyproject.toml not found"
fi

# ── Frontend Checks ──────────────────────────────────────────────
header "Frontend (Astro)"
cd "$ROOT_DIR/frontend"

if [[ -f package.json ]] && [[ -d node_modules ]]; then
  if npm run check 2>/dev/null; then
    ok "astro check (TypeScript)"
  else
    err "astro check (TypeScript)"
  fi
else
  warn "Frontend — package.json or node_modules not found (run: make setup)"
fi

# ── Admin Checks ─────────────────────────────────────────────────
header "Admin (Next.js)"
cd "$ROOT_DIR/admin"

if [[ -f package.json ]] && [[ -d node_modules ]]; then
  if npm run lint 2>/dev/null; then
    ok "next lint (ESLint)"
  else
    err "next lint (ESLint)"
  fi

  if npm run build 2>/dev/null; then
    ok "next build"
  else
    err "next build"
  fi
else
  warn "Admin — package.json or node_modules not found (run: make setup)"
fi

# ── Summary ──────────────────────────────────────────────────────
echo ""
if [[ $FAILED -eq 0 ]]; then
  echo -e "${GREEN}══════════════════════════════════════════════${NC}"
  echo -e "${GREEN}  ✔ All preflight checks passed!${NC}"
  echo -e "${GREEN}══════════════════════════════════════════════${NC}"
  exit 0
else
  echo -e "${RED}══════════════════════════════════════════════${NC}"
  echo -e "${RED}  ✖ Some preflight checks failed!${NC}"
  echo -e "${RED}  Fix the issues above before committing.${NC}"
  echo -e "${RED}══════════════════════════════════════════════${NC}"
  exit 1
fi
