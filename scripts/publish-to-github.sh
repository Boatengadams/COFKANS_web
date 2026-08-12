#!/usr/bin/env bash
#
# Publish the current Cofkans ERP app to GitHub.
#   Repo:   https://github.com/COFKANS/cofkanselectricals-app
#   Branch: develop
#   Author: Boateng Adams <boatengadams4g@gmail.com>
#
# WHY THIS SCRIPT EXISTS:
#   The Figma Make build environment can READ from GitHub but the egress
#   gateway blocks every write verb (POST/PATCH/PUT) and all git push
#   transport with HTTP 520 "Origin is disallowed" — even with the sandbox
#   disabled. So the push cannot happen from inside Make; run this from your
#   own machine, where you have normal network access.
#
# HOW TO USE (on your Mac/PC, with git installed and authenticated to GitHub):
#   1. Download / export this project from Figma Make into a folder.
#   2. Open a terminal in that folder (the one containing package.json).
#   3. Run:   bash scripts/publish-to-github.sh
#
# It stages the Expo app as the repo root, including Firebase deploy config,
# rules, indexes, and Cloud Functions. It drops the stale ce/ copy, then commits
# and pushes to develop WITHOUT force (so it won't clobber a teammate's work).

set -euo pipefail

REPO_URL="https://github.com/COFKANS/cofkanselectricals-app.git"
BRANCH="develop"
SRC="$(pwd)"                       # the exported Make project (run from here)
WORK="$(mktemp -d)"

echo "==> Cloning $REPO_URL ($BRANCH)"
git clone --branch "$BRANCH" --single-branch "$REPO_URL" "$WORK/repo"
cd "$WORK/repo"

echo "==> Clearing tracked files (keeping .git)"
git rm -rq . >/dev/null 2>&1 || true
find . -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +

echo "==> Copying current Expo app as repo root"
( cd "$SRC" && tar -cf - \
    --exclude='./node_modules' --exclude='./.git' --exclude='./dist' \
    --exclude='./build' --exclude='./.vite' --exclude='./.secrets' \
    --exclude='./pat.txt' --exclude='./ce' \
    --exclude='./__figma__entrypoint__.ts' . ) | tar -xf -

echo "==> Committing"
git add -A
git -c user.name="Boateng Adams" -c user.email="boatengadams4g@gmail.com" \
  commit -m "Import current Cofkans Expo app with Firebase backend

Expo root is the canonical current codebase; Firebase deploy config, rules,
indexes, and functions live at the project root. The stale ce/ copy is dropped."

echo "==> Pushing to $BRANCH (no force)"
git push origin "$BRANCH"

echo "==> Done. Pushed to $BRANCH."
