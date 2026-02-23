#!/usr/bin/env bash

set -euo pipefail

usage() {
	cat <<'EOF'
Inspect SQLite schema and run read-only queries.

Usage:
  inspect_sqlite.sh --db <path> --tables
  inspect_sqlite.sh --db <path> --schema <table>
  inspect_sqlite.sh --db <path> --query "<SELECT ...>" [--limit <n>]

Options:
  --db      Path to SQLite file, for example data/ipadMoneyWiz.sqlite
  --tables  List table names
  --schema  Show schema for a table name
  --query   Run a read-only SQL query and print rows
  --limit   Maximum rows printed for --query (default: 20)
EOF
}

db_path=''
show_tables=0
schema_table=''
query_sql=''
limit=20

while (($#)); do
	case "$1" in
	--db)
		db_path="${2:-}"
		shift 2
		;;
	--tables)
		show_tables=1
		shift
		;;
	--schema)
		schema_table="${2:-}"
		shift 2
		;;
	--query)
		query_sql="${2:-}"
		shift 2
		;;
	--limit)
		limit="${2:-}"
		shift 2
		;;
	-h | --help)
		usage
		exit 0
		;;
	*)
		echo "Error: Unknown argument: $1" >&2
		usage >&2
		exit 1
		;;
	esac
done

if [[ -z "$db_path" ]]; then
	echo 'Error: --db is required' >&2
	exit 1
fi

if [[ ! -f "$db_path" ]]; then
	echo "Database file not found: $db_path" >&2
	exit 1
fi

if ! command -v sqlite3 >/dev/null 2>&1; then
	echo 'Error: sqlite3 command is required but not installed' >&2
	exit 1
fi

actions=0
((show_tables)) && ((actions += 1))
[[ -n "$schema_table" ]] && ((actions += 1))
[[ -n "$query_sql" ]] && ((actions += 1))

if ((actions != 1)); then
	echo 'Choose exactly one of --tables, --schema, or --query' >&2
	exit 1
fi

if ! [[ "$limit" =~ ^[0-9]+$ ]] || ((limit < 1)); then
	echo 'Error: --limit must be a positive integer' >&2
	exit 1
fi

run_sql() {
	local sql="$1"
	sqlite3 -readonly -noheader "$db_path" "$sql"
}

if ((show_tables)); then
	run_sql "
		SELECT name
		FROM sqlite_master
		WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
		ORDER BY name
	"
	exit 0
fi

if [[ -n "$schema_table" ]]; then
	schema_rows="$(run_sql "PRAGMA table_info(\"$schema_table\")")"
	if [[ -z "$schema_rows" ]]; then
		echo "No schema found for table: $schema_table" >&2
		exit 1
	fi

	printf '%s\n' "$schema_rows" | awk -F'|' '
		{
			printf "%3s | %-30s | %-12s | not_null=%s | pk=%s | default=%s\n",
				$1, $2, $3, $4, $6, $5
		}
	'
	exit 0
fi

normalized_query="$(
	printf '%s' "$query_sql" \
		| tr '\n' ' ' \
		| sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//' \
		| tr '[:upper:]' '[:lower:]'
)"

if ! printf '%s' "$normalized_query" | grep -Eq '^select([[:space:]]|$)'; then
	echo 'Error: Only SELECT queries are allowed' >&2
	exit 1
fi

tmp_file="$(mktemp)"
trap 'rm -f "$tmp_file"' EXIT

if ! run_sql "$query_sql" >"$tmp_file"; then
	echo 'Error: Failed to execute query' >&2
	exit 1
fi

if [[ ! -s "$tmp_file" ]]; then
	echo '(no rows)'
	exit 0
fi

head -n "$limit" "$tmp_file"
