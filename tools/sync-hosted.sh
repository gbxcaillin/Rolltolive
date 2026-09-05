#!/usr/bin/env bash
# Build the server-hosted version of the game from this branch and push it to a build branch of the SAME repo:
#   main / master  ->  hosted
#   any-other      ->  hosted-<branch with / replaced by ->  (git forbids 'hosted' next to 'hosted/x')
# The build branch holds only deployable files (public/, server/, Dockerfile, render.yaml, fly.toml, package.json).
#
#   tools/sync-hosted.sh            # build from the current branch, commit, push
#   NO_PUSH=1 tools/sync-hosted.sh  # build + commit into a temp clone only (prints its path)
# Env: HOSTED_REPO (default: origin of this repo), HOSTED_BRANCH (override the target branch)
set -euo pipefail
SRC="$(cd "$(dirname "$0")/.." && pwd)"
HOSTED_REPO="${HOSTED_REPO:-$(git -C "$SRC" remote get-url origin)}"
SRC_BRANCH="$(git -C "$SRC" rev-parse --abbrev-ref HEAD)"
case "$SRC_BRANCH" in main|master) DEFAULT_HB="hosted" ;; *) DEFAULT_HB="hosted-$(echo "$SRC_BRANCH" | tr "/" "-")" ;; esac
HB="${HOSTED_BRANCH:-$DEFAULT_HB}"
SHA="$(git -C "$SRC" rev-parse --short HEAD)"
SUBJECT="$(git -C "$SRC" log -1 --pretty=%s)"
STAMP="$(date -u +%Y%m%d-%H%M)"
DEST="${1:-$(mktemp -d)}"

git clone -q --no-checkout "$HOSTED_REPO" "$DEST"
if git -C "$DEST" ls-remote --exit-code --heads origin "$HB" >/dev/null 2>&1; then
  git -C "$DEST" checkout -q -B "$HB" "origin/$HB"
else
  git -C "$DEST" checkout -q --orphan "$HB"
fi
# wipe the tree (keep .git) so files removed upstream disappear from the build too
find "$DEST" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +

# --- build ---
mkdir -p "$DEST/public/art" "$DEST/server"
cp "$SRC/index.html" "$DEST/public/index.html"
cp -R "$SRC/art/." "$DEST/public/art/"
cp "$SRC/server/relay.js" "$DEST/server/relay.js"
cp "$SRC/NETWORK.md" "$DEST/NETWORK.md"
cp -R "$SRC/hosted/." "$DEST/"
sed -i.bak "s/const BUILD = 'dev';/const BUILD = '$SHA $STAMP';/" "$DEST/public/index.html" && rm -f "$DEST/public/index.html.bak"
sed -i.bak "s/\"version\": \"[^\"]*\"/\"version\": \"0.1.0+$SHA\"/" "$DEST/package.json" && rm -f "$DEST/package.json.bak"
grep -q "const BUILD = '$SHA" "$DEST/public/index.html"
node --check "$DEST/server/relay.js"

git -C "$DEST" add -A
if git -C "$DEST" diff --cached --quiet && git -C "$DEST" rev-parse --verify -q HEAD >/dev/null; then echo "build branch $HB already up to date ($SHA)"; exit 0; fi
git -C "$DEST" -c user.name="${GIT_AUTHOR_NAME:-ashfall-sync}" -c user.email="${GIT_AUTHOR_EMAIL:-sync@ashfall.local}" commit -q -m "Build $SHA from $SRC_BRANCH: $SUBJECT"
echo "built $HB from $SRC_BRANCH@$SHA in $DEST"
if [ "${NO_PUSH:-0}" != "1" ]; then git -C "$DEST" push -q origin "HEAD:refs/heads/$HB"; echo "pushed $HB"; fi
