#!/usr/bin/env bash
# Record the screen with the cursor and click markers. Usage: record-desktop.sh start <name> [x,y,w,h] | stop
set -euo pipefail
STATE=/tmp/show-me-desktop.state

case "${1:-}" in
  start)
    mkdir -p show-me
    out="$(pwd)/show-me/$(date +%Y%m%d-%H%M)-${2:-demo}.mov"
    screencapture -v -C -k -x ${3:+-R"$3"} "$out" </dev/null >/dev/null 2>&1 &
    echo "$! $out" > "$STATE"
    sleep 1
    echo "RECORDING $out"
    ;;
  stop)
    [ -f "$STATE" ] || { echo "No recording running"; exit 1; }
    read -r pid out < "$STATE"
    kill -INT "$pid" 2>/dev/null || true
    while kill -0 "$pid" 2>/dev/null; do sleep 0.3; done
    rm -f "$STATE"
    echo "VIDEO $out"
    ;;
  *) echo "Usage: $0 start <name> [x,y,w,h] | stop"; exit 2 ;;
esac
