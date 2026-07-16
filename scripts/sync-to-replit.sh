#!/bin/bash
#
# sync-to-replit.sh
# Push the canonical SOLVY app (unified-ecosystem/) to Replit.
# Replit auto-deploys on push, which then updates solvy.cards.
#
# Usage:
#   ./scripts/sync-to-replit.sh
#
# Prerequisites:
#   - Git remote 'replit' configured:
#       git remote add replit https://replit.com/@smayone/solvy-sovereignitity/.git
#   - Replit authentication configured (personal access token or browser login)
#
# Authentication:
#   - Browser login: just run the script; git will prompt for Replit credentials.
#   - Personal access token:
#       REPLIT_PAT=your_token ./scripts/sync-to-replit.sh
#

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

BRANCH="${1:-main}"
REMOTE="${2:-replit}"

echo "🚀 SOLVY → Replit Sync"
echo "========================"
echo "Branch: $BRANCH"
echo "Remote: $REMOTE"
echo ""

# Verify remote exists
if ! git remote | grep -q "^${REMOTE}$"; then
  echo "❌ Git remote '$REMOTE' not found."
  echo "   Add it with: git remote add $REMOTE https://replit.com/@smayone/solvy-sovereignitity/.git"
  exit 1
fi

# Verify canonical app builds
echo "📦 Building canonical app (unified-ecosystem)..."
cd "$REPO_ROOT/unified-ecosystem"
if [ -f "package.json" ]; then
  if ! npm run build >/dev/null 2>&1; then
    echo "❌ Build failed. Fix errors before pushing to Replit."
    exit 1
  fi
  echo "✅ Build passed"
else
  echo "⚠️  No package.json in unified-ecosystem/; skipping build check"
fi

cd "$REPO_ROOT"

# Show status
echo ""
echo "📋 Repository status:"
git status --short

# Determine push URL
PUSH_REMOTE="$REMOTE"
if [ -n "${REPLIT_PAT:-}" ]; then
  PUSH_REMOTE="https://smayone:${REPLIT_PAT}@replit.com/@smayone/solvy-sovereignitity/.git"
fi

# Push
echo ""
echo "⬆️  Pushing to Replit..."
git push "$PUSH_REMOTE" "$BRANCH"

echo ""
echo "✅ Push complete. Replit will auto-deploy."
echo "   Verify solvy.cards in 1–2 minutes:"
echo "   - Homepage: https://solvy.cards/"
echo "   - Replit app: https://solvy-sovereignitity--smayone.replit.app/"
echo ""
echo "📝 If this was the first push after DNS changes, clear Cloudflare cache:"
echo "   Caching → Configuration → Purge Everything"
