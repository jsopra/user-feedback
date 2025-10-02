#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL não definido" >&2
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql não encontrado no PATH" >&2
  exit 1
fi

for f in scripts/migrations/*.sql; do
  echo "Running $f"
  psql "$DATABASE_URL" -f "$f"
done
