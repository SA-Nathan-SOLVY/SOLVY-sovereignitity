#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# SOLVY Ecosystem — Push to Gitea
#
# Run this from the Shell tab in Replit after making changes.
#
# First-time setup:
#   1. Add the deploy public key to Gitea (see GITEA-SETUP.md)
#   2. Run this script once to verify the connection
#
# Usage:
#   ./git-push.sh                      # push with auto commit message
#   ./git-push.sh "my commit message"  # push with custom message
# ─────────────────────────────────────────────────────────────────────────────

set -e

MSG="${1:-Auto deploy: $(date '+%Y-%m-%d %H:%M')}"

echo "→ Staging all changes..."
git add -A

echo "→ Committing: $MSG"
git commit -m "$MSG" 2>/dev/null || echo "  (nothing new to commit)"

echo "→ Pushing to Gitea (origin)..."
GIT_SSH_COMMAND="ssh -i $HOME/.ssh/gitea_deploy -o StrictHostKeyChecking=no" \
  git push origin main

echo "✓ Pushed to https://git.ebl.beauty/smayone/sovereignitity-solvy"
