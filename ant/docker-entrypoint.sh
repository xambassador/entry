#!/bin/sh
set -eu

db_dir="$(dirname "$ENTRY_DB_PATH")"

mkdir -p "$ENTRY_DATA_DIR" "$db_dir"

exec /app/server
