#!/usr/bin/env bash
# =============================================================================
# scripts/setup.sh — First-time local development setup
# Usage: make setup
# =============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# ── Color helpers ────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info() { echo -e "${CYAN}ℹ ${NC} $*"; }
ok()   { echo -e "${GREEN}✔ ${NC} $*"; }
warn() { echo -e "${YELLOW}⚠ ${NC} $*"; }
err()  { echo -e "${RED}✖  $*${NC}"; }

# ── Requirements ─────────────────────────────────────────────────────────────
REQUIRED_PYTHON_MAJOR=3
REQUIRED_PYTHON_MINOR=11

python_version_ok() {
  local ver
  ver="$(python3 --version 2>/dev/null | awk '{print $2}')"
  if [[ -z "$ver" ]]; then return 1; fi
  local major minor
  major="$(echo "$ver" | cut -d. -f1)"
  minor="$(echo "$ver" | cut -d. -f2)"
  [[ "$major" -gt "$REQUIRED_PYTHON_MAJOR" ]] && return 0
  [[ "$major" -eq "$REQUIRED_PYTHON_MAJOR" && "$minor" -ge "$REQUIRED_PYTHON_MINOR" ]] && return 0
  return 1
}

check_prereqs() {
  local missing=0

  info "Checking prerequisites..."

  # ── Node.js / npm ──
  if ! command -v node &>/dev/null; then
    err "node is not installed (https://nodejs.org)"; missing=1
  fi
  if ! command -v npm &>/dev/null; then
    err "npm is not installed (bundled with Node.js)"; missing=1
  fi
  if [[ $missing -eq 1 ]]; then
    err "Install the missing prerequisites above, then re-run."
    exit 1
  fi

  # ── Python 3.11+ (auto-install via pyenv if too old) ──
  if ! python_version_ok; then
    local current_ver
    current_ver="$(python3 --version 2>/dev/null | awk '{print $2}' || echo 'not found')"
    warn "Python $current_ver found — need ${REQUIRED_PYTHON_MAJOR}.${REQUIRED_PYTHON_MINOR}+"

    # Install pyenv if missing
    if ! command -v pyenv &>/dev/null; then
      warn "pyenv not found — installing automatically ..."
      curl -sSL https://pyenv.run | bash
      export PYENV_ROOT="$HOME/.pyenv"
      export PATH="$PYENV_ROOT/bin:$PATH"
      eval "$(pyenv init - bash 2>/dev/null)" || true
      if ! command -v pyenv &>/dev/null; then
        err "pyenv installation failed."
        exit 1
      fi
      ok "pyenv installed"
    fi

    local target_ver="${REQUIRED_PYTHON_MAJOR}.${REQUIRED_PYTHON_MINOR}"
    if ! pyenv versions --bare 2>/dev/null | grep -q "^${target_ver}"; then
      warn "Installing Python ${target_ver} via pyenv ..."
      pyenv install "${target_ver}" -s
      ok "Python ${target_ver} installed via pyenv"
    fi

    pyenv local "${target_ver}" 2>/dev/null || pyenv local "$(pyenv versions --bare | grep "^${target_ver}" | tail -1)"
    eval "$(pyenv init - bash 2>/dev/null)" || true

    if ! python_version_ok; then
      err "Failed to activate Python ${target_ver}."
      exit 1
    fi
    ok "Using $(python3 --version)"
  else
    ok "Python $(python3 --version 2>/dev/null | awk '{print $2}') ✓"
  fi

  # ── Poetry ──
  if ! command -v poetry &>/dev/null; then
    warn "Poetry not found — installing automatically ..."
    curl -sSL https://install.python-poetry.org | python3 -
    export PATH="$HOME/.local/bin:$PATH"
    if ! command -v poetry &>/dev/null; then
      err "Poetry installation failed."
      exit 1
    fi
    ok "Poetry $(poetry --version) installed"
  else
    ok "Poetry $(poetry --version 2>/dev/null | head -n 1) ✓"
  fi
}

# ── Setup helpers ────────────────────────────────────────────────────────────
setup_python_package() {
  local pkg_dir="$1"
  local pkg_name
  pkg_name="$(basename "$pkg_dir")"

  info "Setting up Python package: $pkg_name"

  (cd "$pkg_dir" && poetry config virtualenvs.in-project true 2>/dev/null || true)
  (cd "$pkg_dir" && poetry env use python3 2>/dev/null || true)

  # Setup env if needed
  if [[ ! -f "$pkg_dir/.env" && -f "$pkg_dir/.env.sample" ]]; then
    cp "$pkg_dir/.env.sample" "$pkg_dir/.env"
    warn "  Created .env from .env.sample in $pkg_name"
  fi

  if [[ ! -d "$pkg_dir/.venv" ]]; then
    info "  Creating virtual environment for $pkg_name ..."
    (cd "$pkg_dir" && poetry install --no-interaction)
    ok "  Virtual environment created for $pkg_name"
  else
    info "  Syncing dependencies for $pkg_name ..."
    (cd "$pkg_dir" && poetry install --no-interaction)
    ok "  Dependencies synced for $pkg_name"
  fi
}

setup_node_package() {
  local pkg_dir="$1"
  local pkg_name
  pkg_name="$(basename "$pkg_dir")"
  local env_file=".env"
  [[ "$pkg_name" == "admin" ]] && env_file=".env.local"

  info "Setting up Node package: $pkg_name"

  # Setup env if needed
  if [[ ! -f "$pkg_dir/$env_file" && -f "$pkg_dir/.env.sample" ]]; then
    cp "$pkg_dir/.env.sample" "$pkg_dir/$env_file"
    warn "  Created $env_file from .env.sample in $pkg_name"
  fi

  if [[ ! -d "$pkg_dir/node_modules" ]]; then
    info "  Installing node_modules for $pkg_name ..."
    (cd "$pkg_dir" && npm install)
    ok "  node_modules installed for $pkg_name"
  else
    ok "  node_modules already present for $pkg_name"
  fi
}

# ── Main ─────────────────────────────────────────────────────────────────────
main() {
  echo ""
  echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║   Global Events Travels — Local Setup       ║${NC}"
  echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
  echo ""

  check_prereqs
  echo ""
  
  setup_python_package "$ROOT_DIR/backend"
  echo ""
  
  # create data directory for backend
  mkdir -p "$ROOT_DIR/backend/data"
  ok "  backend/data directory ensured"
  echo ""
  
  setup_node_package "$ROOT_DIR/frontend"
  echo ""
  
  setup_node_package "$ROOT_DIR/admin"

  echo ""
  ok "Setup complete! Next:"
  info "  1. Edit .env files with your API keys and secrets"
  info "  2. make db-reset     — seed the database"
  info "  3. make dev          — start all dev servers"
  info "  4. make preflight    — run quality checks"
  echo ""
}

main "$@"
