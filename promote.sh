#!/bin/sh
# Copies preview to live, only if every check passes.
set -e
cd "$(dirname "$0")"
node test/guard.mjs preview
node --test test/*.test.mjs > /dev/null || { echo 'Checks failed. Run: node --test test/*.test.mjs'; exit 1; }
rsync -a --delete preview/ live/
echo 'live now matches preview. Commit and push to publish.'
