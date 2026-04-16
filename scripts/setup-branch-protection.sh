#!/usr/bin/env bash
# Source: cli.github.com + docs.github.com/en/rest/branches/branch-protection
# Run once (in Wave 7) after the first green CI on a scratch PR, so the check contexts exist.
# Usage: ./scripts/setup-branch-protection.sh  (run from repo root; requires `gh` auth)
set -euo pipefail

REPO=$(gh repo view --json nameWithOwner --jq '.nameWithOwner')

if [[ -z "$REPO" ]]; then
  echo "ERROR: could not resolve repo. Run 'gh auth login' first."
  exit 1
fi

echo "Configuring branch protection for $REPO:main"

gh api -X PUT "repos/$REPO/branches/main/protection" \
  --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "typecheck",
      "biome-check",
      "content-sync",
      "image-budget",
      "smoke",
      "pr-title"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "require_code_owner_reviews": true,
    "dismiss_stale_reviews": true
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON

echo "✓ Branch protection configured."
