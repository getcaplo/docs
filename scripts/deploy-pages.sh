#!/bin/sh
# Publishes dist/ to the gh-pages branch, which GitHub Pages serves at docs.caplo.si.
# Run after `npm run build` on a clean main checkout; CI and manual deploys use this same script.
set -eu

test "$(git branch --show-current)" = main || test "${GITHUB_REF:-}" = refs/heads/main || { echo "deploy from main" >&2; exit 1; }
test -z "$(git status --porcelain)" || { echo "commit or stash changes first" >&2; exit 1; }
test -f dist/index.html && test -f dist/CNAME || { echo "run npm run build first" >&2; exit 1; }

source=$(git rev-parse --short HEAD)
site=$(mktemp -d)
trap 'git worktree remove --force "$site" 2>/dev/null || true' EXIT

if git fetch --quiet origin gh-pages 2>/dev/null; then
	git worktree add --quiet -B gh-pages "$site" FETCH_HEAD
else
	git worktree add --quiet --orphan -b gh-pages "$site"
fi
find "$site" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -R dist/. "$site/"
git -C "$site" add -A
if git -C "$site" diff --cached --quiet; then
	echo "gh-pages already has this build"
	exit 0
fi
git -C "$site" commit --quiet -m "Deploy $source"
git -C "$site" push --quiet origin gh-pages
echo "deployed $source to gh-pages"
