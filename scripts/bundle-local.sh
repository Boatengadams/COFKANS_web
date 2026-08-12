#!/usr/bin/env bash
#
# Bundle the Cofkans ERP app into a single tarball you can copy to your Kali box,
# unpack, install, and run. Arranges the project the same way it will live in the
# GitHub repo: the Expo app is the root, including Firebase deploy config,
# rules, indexes, and Cloud Functions. The stale ce/ copy is dropped.
#
# Usage (run from the project root, the folder with package.json):
#   bash scripts/bundle-local.sh
#
# Produces:  cofkans-erp-local.tar.gz   (in the current directory)
# Then on Kali:
#   tar -xzf cofkans-erp-local.tar.gz && cd cofkans-erp && pnpm install && pnpm dev
# See docs/RUN-LOCALLY-KALI.md for full instructions.

set -euo pipefail

SRC="$(pwd)"
OUT="cofkans-erp-local.tar.gz"
STAGE="$(mktemp -d)/cofkans-erp"
mkdir -p "$STAGE"

echo "==> Staging app as repo root"
tar -cf - \
  --exclude='./node_modules' --exclude='./.git' --exclude='./dist' \
  --exclude='./build' --exclude='./.vite' --exclude='./.secrets' \
  --exclude='./pat.txt' --exclude='./ce' --exclude="./$OUT" \
  --exclude='./__figma__entrypoint__.ts' --exclude='./verify.mjs' \
  -C "$SRC" . | tar -xf - -C "$STAGE"

echo "==> Sanity checks"
test -f "$STAGE/package.json"                                   && echo "    package.json OK"
test -f "$STAGE/app.json"                                        && echo "    app.json OK"
test -f "$STAGE/firebase.json"                                   && echo "    firebase.json OK"
test -f "$STAGE/functions/src/index.ts"                          && echo "    functions OK"
test -f "$STAGE/src/lib/developer-host.ts"                      && echo "    developer-host.ts OK"
test -f "$STAGE/src/app/pages/DeveloperConsole.tsx"            && echo "    DeveloperConsole.tsx OK"
[ ! -e "$STAGE/pat.txt" ] && [ ! -e "$STAGE/.secrets" ]        && echo "    no secrets bundled OK"

echo "==> Writing $OUT"
tar -czf "$SRC/$OUT" -C "$(dirname "$STAGE")" "$(basename "$STAGE")"
echo "==> Done: $SRC/$OUT ($(du -h "$SRC/$OUT" | cut -f1)), $(find "$STAGE" -type f | wc -l | tr -d ' ') files"
