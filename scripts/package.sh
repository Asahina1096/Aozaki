#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
OUTPUT_ZIP="$ROOT_DIR/aozaki-dist.zip"

echo "[package] Cleaning previous archive..."
rm -f "$OUTPUT_ZIP"

echo "[package] Building project..."
(cd "$ROOT_DIR" && bun run build)

if [ ! -d "$DIST_DIR" ]; then
  echo "Build directory $DIST_DIR does not exist; aborting." >&2
  exit 1
fi

echo "[package] Compressing dist -> $OUTPUT_ZIP"
(cd "$DIST_DIR" && zip -rq "$OUTPUT_ZIP" .)

echo "[package] Done: $OUTPUT_ZIP"
