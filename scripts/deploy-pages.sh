#!/bin/sh
# Builds the site for GitHub Pages and pushes it to the gh-pages branch.
# Runs locally because the @acko packages come from ACKO's internal registry, which GitHub's servers can't reach.
set -e
cd "$(dirname "$0")/.."
REMOTE="$(git remote get-url origin)"
GH_PAGES=1 npx vite build
cp dist/index.html dist/404.html   # lets links like /acko-drivecam/drivecam-reveal open directly
touch dist/.nojekyll
cd dist
rm -rf .git
git init -q -b gh-pages
git add -A
git commit -q -m "Deploy to GitHub Pages"
git push -q -f "$REMOTE" gh-pages
rm -rf .git
echo "Deployed: https://mudit-des.github.io/acko-drivecam/drivecam-reveal"
