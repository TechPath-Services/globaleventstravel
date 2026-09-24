#!/usr/bin/env bash
# =============================================================================
# scripts/dev_up.sh — Local Development Runner
# Usage:
#   make dev                     # start ALL services
#   make dev-service s=backend   # start ONE service by name
# =============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$ROOT_DIR/.dev"

# ── Color helpers ────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info() { echo -e "${CYAN}ℹ ${NC} $*"; }
ok()   { echo -e "${GREEN}✔ ${NC} $*"; }
err()  { echo -e "${RED}✖  $*${NC}"; }

# ── Service launchers ────────────────────────────────────────────────────────
start_service() {
  local svc="$1"
  local pkg_dir="$ROOT_DIR/$svc"

  if [[ ! -d "$pkg_dir" ]]; then
    err "Project directory not found: $svc"
    return 1
  fi

  mkdir -p "$LOG_DIR"

  case "$svc" in
    backend)
      info "Starting $svc on :8000 ..."
      (cd "$pkg_dir" && nohup poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 \
        > "$LOG_DIR/backend.log" 2>&1 &)
      ok "$svc → http://localhost:8000/docs  (log: .dev/backend.log)"
      ;;

    frontend)
      info "Starting $svc on :4321 ..."
      (cd "$pkg_dir" && nohup npm run dev > "$LOG_DIR/frontend.log" 2>&1 &)
      ok "$svc → http://localhost:4321  (log: .dev/frontend.log)"
      ;;

    admin)
      info "Starting $svc on :3001 ..."
      (cd "$pkg_dir" && nohup npm run dev > "$LOG_DIR/admin.log" 2>&1 &)
      ok "$svc → http://localhost:3001  (log: .dev/admin.log)"
      ;;

    *)
      err "Unknown service: $svc"
      echo "  Available: backend, frontend, admin"
      return 1
      ;;
  esac
}

# ── Main ─────────────────────────────────────────────────────────────────────
ALL_SERVICES=(backend frontend admin)

main() {
  echo ""
  echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║   Global Events Travels — Dev Runner        ║${NC}"
  echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
  echo ""

  if [[ $# -gt 0 ]]; then
    # Single-service mode
    info "Starting single service: $1"
    echo ""
    start_service "$1"
  else
    # All-services mode
    info "Starting all services ..."
    echo ""
    for svc in "${ALL_SERVICES[@]}"; do
      start_service "$svc"
      echo ""
    done
  fi

  echo ""
  echo -e "${GREEN}══════════════════════════════════════════════${NC}"
  echo -e "${GREEN}  All requested services are starting up.${NC}"
  echo -e "${GREEN}  Logs are in: .dev/${NC}"
  echo -e "${GREEN}  Stop with:   make dev-stop${NC}"
  echo -e "${GREEN}══════════════════════════════════════════════${NC}"
  echo ""
}

main "$@"
