#!/usr/bin/env bash
# =============================================================================
# scripts/dev_down.sh — Stop all local dev services (Linux / macOS)
#
# Usage:
#   make dev-stop              # stop ALL services
#   make dev-stop s=backend    # stop ONE service by name
# =============================================================================

set -euo pipefail

# ── Color helpers ────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info() { echo -e "${CYAN}ℹ ${NC} $*"; }
ok()   { echo -e "${GREEN}✔ ${NC} $*"; }
warn() { echo -e "${YELLOW}⚠ ${NC} $*"; }

# ── Port map ─────────────────────────────────────────────────────────────────
ALL_SERVICES=(backend frontend admin)

get_port() {
  case "$1" in
    backend) echo 8000 ;;
    frontend) echo 4321 ;;
    admin) echo 3001 ;;
    *) echo "" ;;
  esac
}

stop_by_port() {
  local svc="$1"
  local port="$2"

  local pids
  pids=$(lsof -ti :"$port" 2>/dev/null || true)

  if [[ -n "$pids" ]]; then
    echo "$pids" | xargs kill -9 2>/dev/null || true
    ok "Stopped $svc (port $port)"
  else
    warn "$svc was not running (port $port)"
  fi
}

# ── Main ─────────────────────────────────────────────────────────────────────
main() {
  echo ""
  echo -e "${CYAN}Stopping dev services ...${NC}"
  echo ""

  if [[ $# -gt 0 ]]; then
    local svc="$1"
    local port=$(get_port "$svc")
    if [[ -z "$port" ]]; then
      echo -e "${RED}✖  Unknown service: $svc${NC}"
      echo "  Available: ${ALL_SERVICES[*]}"
      exit 1
    fi
    stop_by_port "$svc" "$port"
  else
    for svc in "${ALL_SERVICES[@]}"; do
      stop_by_port "$svc" "$(get_port "$svc")"
    done
  fi

  echo ""
  ok "Done."
  echo ""
}

main "$@"
