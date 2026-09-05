#!/usr/bin/env bash
# Sync the offline/test source (this repo) into the hosted-build repo and push both.
#
#   tools/sync-hosted.sh                 # sync ../ashfall-hosted (cloned on first run), commit, push
#   tools/sync-hosted.sh /path/to/dest   # explicit checkout
#   NO_PUSH=1 tools/sync-hosted.sh       # build + commit only
#
# Env: HOSTED_REPO (default https://github.com/gbxcaillin/ashfall-hosted.git), HOSTED_BRANCH (default: current branch)
set -euo pipefail
SRC="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:-$SRC/../ashfall-hosted}"
HOSTED_REPO="${HOSTED_REPO:-https://github.com/gbxcaillin/ashfall-hosted.git}"
BRANCH="${HOSTED_BRANCH:-$(git -C "$SRC" rev-parse --abbrev-ref HEAD)}"
SHA="$(git -C "$SRC" rev-parse --short HEAD)"
SUBJECT="$(git -C "$SRC" log -1 --pretty=%s)"
STAMP="$(date -u +%Y%m%d-%H%M)"

if [ ! -d "$DEST/.git" ]; then
  echo "cloning $HOSTED_REPO -> $DEST"
  git clone "$HOSTED_REPO" "$DEST" 2>/dev/null || { mkdir -p "$DEST"; git -C "$DEST" init -q; git -C "$DEST" remote add origin "$HOSTED_REPO"; }
fi
git -C "$DEST" checkout -q -B "$BRANCH" 2>/dev/null || true
git -C "$DEST" pull -q --rebase origin "$BRANCH" 2>/dev/null || true

# --- build: copy, then stamp ---
rm -rf "$DEST/public" "$DEST/server"
mkdir -p "$DEST/public/art" "$DEST/server"
cp "$SRC/index.html" "$DEST/public/index.html"
cp -R "$SRC/art/." "$DEST/public/art/"
cp "$SRC/server/relay.js" "$DEST/server/relay.js"
cp "$SRC/NETWORK.md" "$DEST/NETWORK.md"
cp -R "$SRC/hosted/." "$DEST/"
sed -i.bak "s/const BUILD = 'dev';/const BUILD = '$SHA $STAMP';/" "$DEST/public/index.html" && rm -f "$DEST/public/index.html.bak"
sed -i.bak "s/\"version\": \"[^\"]*\"/\"version\": \"0.1.0+$SHA\"/" "$DEST/package.json" && rm -f "$DEST/package.json.bak"

# sanity: the hosted page must not carry the dev stamp and the relay must parse
grep -q "const BUILD = '$SHA" "$DEST/public/index.html"
node --check "$DEST/server/relay.js"

git -C "$DEST" add -A
if git -C "$DEST" diff --cached --quiet; then echo "hosted build already up to date ($SHA)"; exit 0; fi
git -C "$DEST" -c user.name="${GIT_AUTHOR_NAME:-ashfall-sync}" -c user.email="${GIT_AUTHOR_EMAIL:-sync@ashfall.local}" commit -q -m "Sync from Rolltolive $SHA: $SUBJECT"
echo "hosted build committed ($SHA) on branch $BRANCH"
if [ "${NO_PUSH:-0}" != "1" ]; then git -C "$DEST" push -u origin "$BRANCH"; echo "pushed to $HOSTED_REPO ($BRANCH)"; fi
