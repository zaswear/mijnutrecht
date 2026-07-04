#!/usr/bin/env bash
# Visual regression test for mijnutrecht using agent-browser diff.
#
# Modes:
#   ./scripts/screenshot-test.sh baseline   → guarda baseline.png (antes de cambios)
#   ./scripts/screenshot-test.sh compare    → compara con el baseline guardado
#   ./scripts/screenshot-test.sh auto       → guarda baseline, sirve el sitio, compara (todo en uno)
#
# Requiere:
#   agent-browser (ya instalado)
#   python3 (para servir el sitio local)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SHOTS_DIR="$ROOT/scripts/.screenshots"
BASELINE="$SHOTS_DIR/baseline.png"
CURRENT="$SHOTS_DIR/current.png"
DIFF_OUT="$SHOTS_DIR/diff.png"
PORT=8765

mkdir -p "$SHOTS_DIR"

serve_site() {
  # Servir el sitio estático localmente
  echo "Sirviendo sitio en http://localhost:$PORT ..."
  python3 -m http.server $PORT --directory "$ROOT" &>/dev/null &
  SERVE_PID=$!
  sleep 1
  echo $SERVE_PID
}

kill_server() {
  local pid=${1:-}
  [ -n "$pid" ] && kill "$pid" 2>/dev/null || true
  agent-browser close --all 2>/dev/null || true
}

take_screenshot() {
  local url="$1"
  local output="$2"
  echo "Capturando $url ..."
  agent-browser close --all 2>/dev/null || true
  agent-browser open "$url" --wait-until networkidle
  sleep 2
  # Captura full-page
  agent-browser screenshot --full "$output"
  agent-browser close
  echo "  → Guardado en $output"
}

MODE="${1:-help}"

case "$MODE" in
  baseline)
    PID=$(serve_site)
    trap "kill_server $PID" EXIT
    take_screenshot "http://localhost:$PORT" "$BASELINE"
    echo "✓ Baseline guardado. Haz tus cambios y ejecuta: ./scripts/screenshot-test.sh compare"
    ;;

  compare)
    if [ ! -f "$BASELINE" ]; then
      echo "❌ No hay baseline. Ejecuta primero: ./scripts/screenshot-test.sh baseline"
      exit 1
    fi
    PID=$(serve_site)
    trap "kill_server $PID" EXIT
    take_screenshot "http://localhost:$PORT" "$CURRENT"
    echo "Comparando con baseline..."
    agent-browser diff screenshot --baseline "$BASELINE" -o "$DIFF_OUT" "$CURRENT" 2>/dev/null || \
      agent-browser diff screenshot --baseline "$BASELINE" -o "$DIFF_OUT"
    echo "✓ Diff guardado en $DIFF_OUT"
    echo "  Baseline:  $BASELINE"
    echo "  Actual:    $CURRENT"
    echo "  Diff:      $DIFF_OUT"
    ;;

  live)
    # Comparar contra el sitio publicado en GitHub Pages
    LIVE="https://zaswear.github.io/mijnutrecht"
    if [ ! -f "$BASELINE" ]; then
      echo "Capturando baseline desde $LIVE ..."
      take_screenshot "$LIVE" "$BASELINE"
      echo "✓ Baseline del sitio live guardado."
    else
      take_screenshot "$LIVE" "$CURRENT"
      echo "Comparando local vs GitHub Pages..."
      PID=$(serve_site)
      take_screenshot "http://localhost:$PORT" "$SHOTS_DIR/local.png"
      kill_server $PID
      agent-browser diff screenshot --baseline "$CURRENT" -o "$DIFF_OUT" "$SHOTS_DIR/local.png"
      echo "✓ Diff local vs live guardado en $DIFF_OUT"
    fi
    ;;

  auto)
    PID=$(serve_site)
    trap "kill_server $PID" EXIT
    take_screenshot "http://localhost:$PORT" "$BASELINE"
    echo "Baseline capturado. Esperando 3s antes de segunda captura (modo smoke test)..."
    sleep 3
    take_screenshot "http://localhost:$PORT" "$CURRENT"
    agent-browser diff screenshot --baseline "$BASELINE" -o "$DIFF_OUT" "$CURRENT" 2>/dev/null || true
    echo "✓ Screenshots en $SHOTS_DIR/"
    ;;

  *)
    echo "Uso:"
    echo "  ./scripts/screenshot-test.sh baseline  → captura estado actual como referencia"
    echo "  ./scripts/screenshot-test.sh compare   → compara cambios contra la referencia"
    echo "  ./scripts/screenshot-test.sh live       → compara local vs GitHub Pages"
    echo "  ./scripts/screenshot-test.sh auto       → smoke test rápido (dos capturas seguidas)"
    ;;
esac
