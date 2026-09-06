#!/usr/bin/env bash
# Run a command against the local Netlify Database.
#
# `netlify dev` starts a local Postgres and sets NETLIFY_DB_URL for the site
# process it spawns, but `netlify dev:exec` does not pass that variable on. So
# one-off scripts ask the CLI for the connection string and hand it to
# src/db/index.ts as DATABASE_URL.
#
# Requires `netlify dev` to already be running in another terminal.
#
#   bash scripts/with-local-db.sh ./node_modules/.bin/tsx scripts/seedDev.ts
set -euo pipefail

CLI=./node_modules/.bin/netlify

url="$("$CLI" database status --show-credentials 2>/dev/null \
  | grep -oE 'postgres://[^ ]+' \
  | head -1)"

if [ -z "$url" ]; then
  echo "Could not read a local database connection string." >&2
  echo "Is \`netlify dev\` running? Check \`netlify database status\`." >&2
  exit 1
fi

case "$url" in
  *localhost*|*127.0.0.1*) ;;
  *)
    echo "Refusing to run: the connection string is not local." >&2
    echo "This guard exists so a seed or import can never hit production." >&2
    exit 1
    ;;
esac

DATABASE_URL="$url" exec "$@"
