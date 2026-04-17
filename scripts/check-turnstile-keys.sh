#!/usr/bin/env bash
# Source: SPAM-06 + RESEARCH §Pitfall 3 + Cloudflare Turnstile test-keys docs.
# Fails the build if any documented Turnstile test-key substring appears in the production bundle.
set -euo pipefail

DIST_DIR="${1:-dist}"
if [[ ! -d "$DIST_DIR" ]]; then
  echo "check-turnstile-keys: dist directory '$DIST_DIR' not found; run 'pnpm build' first" >&2
  exit 2
fi

# Known public documented test keys (site keys and secrets) — never allowed in production bundles.
# Refs: https://developers.cloudflare.com/turnstile/troubleshooting/testing/
TEST_KEY_PATTERNS=(
  "1x00000000000000000000AA"                         # always-passes site key
  "2x00000000000000000000AB"                         # always-blocks site key
  "3x00000000000000000000FF"                         # forces interactive site key
  "1x0000000000000000000000000000000AA"              # always-passes secret key
  "2x0000000000000000000000000000000AA"              # always-blocks secret key
  "3x0000000000000000000000000000000AA"              # forces interactive secret key
  "XXXX.DUMMY.TOKEN.XXXX"                            # dummy token string
)

FOUND=0
for pattern in "${TEST_KEY_PATTERNS[@]}"; do
  if grep -R --binary-files=text -l -F "$pattern" "$DIST_DIR" > /dev/null 2>&1; then
    echo "check-turnstile-keys: FOUND forbidden test-key substring '$pattern' in $DIST_DIR" >&2
    grep -R --binary-files=text -l -F "$pattern" "$DIST_DIR" >&2 || true
    FOUND=1
  fi
done

if [[ "$FOUND" -ne 0 ]]; then
  echo "check-turnstile-keys: FAIL — Turnstile test keys detected in production bundle. Fix: ensure PUBLIC_TURNSTILE_SITE_KEY / TURNSTILE_SECRET_KEY are set to production values in Vercel." >&2
  exit 1
fi

echo "check-turnstile-keys: OK — no Turnstile test-key substrings found in $DIST_DIR"
exit 0
