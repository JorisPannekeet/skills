#!/usr/bin/env bash
# Record the booted iOS Simulator. Usage: record-ios.sh start <name> | stop
set -euo pipefail
STATE=/tmp/show-me-ios.state

case "${1:-}" in
  start)
    mkdir -p show-me
    out="$(pwd)/show-me/$(date +%Y%m%d-%H%M)-${2:-demo}.mp4"
    open -a Simulator
    xcrun simctl io booted recordVideo --codec=h264 --force "$out" >/dev/null 2>&1 &
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
  *) echo "Usage: $0 start <name> | stop"; exit 2 ;;
esac
