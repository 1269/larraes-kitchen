#!/usr/bin/env bash
# Source: CONTEXT D-16 — fails CI if any public/images/ file exceeds 600KB
set -euo pipefail

BUDGET_BYTES=$((600 * 1024))
ROOT="${1:-public/images}"

if [[ ! -d "$ROOT" ]]; then
  echo "ℹ  $ROOT does not exist — nothing to check."
  exit 0
fi

# BSD find (macOS) uses -size with 'c' suffix; GNU find (Linux/CI) is identical.
# Portable form: use `stat` per file for byte-accurate comparison.
OVERSIZED=()
while IFS= read -r -d '' file; do
  size=$(wc -c <"$file" | tr -d ' ')
  if (( size > BUDGET_BYTES )); then
    OVERSIZED+=("$file ($(( size / 1024 )) KB)")
  fi
done < <(find "$ROOT" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.webp' -o -iname '*.avif' -o -iname '*.gif' \) -print0)

if (( ${#OVERSIZED[@]} > 0 )); then
  echo "ERROR: ${#OVERSIZED[@]} image(s) exceed the 600KB budget:"
  printf '  - %s\n' "${OVERSIZED[@]}"
  echo ""
  echo "Fix: re-export at ≤2560px with quality 80–90 via squoosh/ImageOptim."
  exit 1
fi

echo "✓ All images under 600KB budget."
