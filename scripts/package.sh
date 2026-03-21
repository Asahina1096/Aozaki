#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
TEMP_DIR="$ROOT_DIR/theme-package"
PREVIEW_FILE="$ROOT_DIR/preview.png"
THEME_META_FILE="$ROOT_DIR/komari-theme.json"
OUTPUT_PREFIX="aozaki-v"

print_error() {
  printf '[package] ERROR: %s\n' "$1" >&2
}

print_success() {
  printf '[package] %s\n' "$1"
}

check_dependencies() {
  echo "[package] Checking dependencies..."

  if ! command -v bun >/dev/null 2>&1; then
    print_error "bun is not installed"
    exit 1
  fi

  if ! command -v zip >/dev/null 2>&1; then
    print_error "zip is not installed"
    exit 1
  fi

  print_success "Dependencies are ready"
}

build_project() {
  echo "[package] Building project..."
  (cd "$ROOT_DIR" && bun run build)
  print_success "Build completed"
}

verify_files() {
  echo "[package] Verifying required files..."

  if [ ! -f "$PREVIEW_FILE" ]; then
    print_error "preview.png not found"
    exit 1
  fi

  if [ ! -f "$THEME_META_FILE" ]; then
    print_error "komari-theme.json not found"
    exit 1
  fi

  if [ ! -d "$DIST_DIR" ]; then
    print_error "dist/ directory not found"
    exit 1
  fi

  print_success "Required files verified"
}

create_package() {
  local version_date commit_hash zip_name output_zip

  echo "[package] Creating theme package..."
  version_date="$(date +"%y.%m.%d")"

  if git -C "$ROOT_DIR" rev-parse --short HEAD >/dev/null 2>&1; then
    commit_hash="$(git -C "$ROOT_DIR" rev-parse --short HEAD)"
  else
    commit_hash="dev"
  fi

  zip_name="${OUTPUT_PREFIX}${version_date}-${commit_hash}.zip"
  output_zip="$ROOT_DIR/$zip_name"

  rm -rf "$TEMP_DIR"
  mkdir -p "$TEMP_DIR"

  cp "$PREVIEW_FILE" "$TEMP_DIR/"
  cp "$THEME_META_FILE" "$TEMP_DIR/"
  cp -r "$DIST_DIR" "$TEMP_DIR/"

  rm -f "$output_zip"
  (cd "$TEMP_DIR" && zip -rq "$output_zip" .)

  rm -rf "$TEMP_DIR"
  print_success "Created: ./${zip_name}"
}

main() {
  check_dependencies
  build_project
  verify_files
  create_package
  print_success "Theme package build completed"
}

main "$@"
