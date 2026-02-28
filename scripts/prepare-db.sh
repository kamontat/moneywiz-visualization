#!/usr/bin/env bash

set -euo pipefail

DATA_DIR="data"
TEMP_DIR="$DATA_DIR/.prepare-db.tmp"

DB_FILE="ipadMoneyWiz.sqlite"
ZIP_FILE=""

main() {
	_assert_cmd unzip
	_assert_cmd sqlite3

	cleanup

	_select_zip_file
	_unzip_file
	_commit_wal
	_deploy_db

	echo "Done. Database(s) ready in $DATA_DIR/"
}

cleanup() {
	rm -rf "$TEMP_DIR"
	if [ -f "$ZIP_FILE" ]; then
		rm -f "$ZIP_FILE"
	fi
}

_assert_cmd() {
	if ! command -v "$1" &>/dev/null; then
		echo "Error: $1 is not installed" >&2
		return 1
	fi
}

_select_zip_file() {
	local zip_files=()
	while IFS= read -r -d '' f; do
		zip_files+=("$f")
	done < <(find "$DATA_DIR" -maxdepth 1 -name '*.zip' -print0 | sort -z)

	if [ ${#zip_files[@]} -le 0 ]; then
		echo "Error: No .zip files found in $DATA_DIR/" >&2
		return 1
	fi

	if [ ${#zip_files[@]} -eq 1 ]; then
		ZIP_FILE="${zip_files[0]}"
		echo
		echo "Selected: $ZIP_FILE"
		return 0
	fi

	echo "Multiple zip files found:"
	for i in "${!zip_files[@]}"; do
		echo "  $((i + 1))) ${zip_files[$i]}"
	done

	while true; do
		printf "Select a file [1-%d]: " "${#zip_files[@]}"
		read -r choice
		if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -gt 0 ] && [ "$choice" -le "${#zip_files[@]}" ]; then
			ZIP_FILE="${zip_files[$((choice - 1))]}"
			echo
			echo "Selected: $ZIP_FILE"
			return 0
		fi
		echo "Error: Invalid selection, please try again" >&2
	done
}

_unzip_file() {
	mkdir -p "$TEMP_DIR"
	unzip -q -o "$ZIP_FILE" '*.sqlite' '*.sqlite-wal' '*.sqlite-shm' -d "$TEMP_DIR"
	echo "Extracted SQLite files to temp directory"
}

_commit_wal() {
	local file_path="$TEMP_DIR/$DB_FILE"
	local osize=0 nsize=0 diff=0

	if [ ! -f "$file_path" ]; then
		echo "Error: No SQLite files found in the archive" >&2
		return 1
	fi

	osize=$(__cal_file_size "$file_path")
	echo "Committing WAL changes for $DB_FILE..."
	local query="PRAGMA wal_checkpoint; PRAGMA journal_mode = OFF; VACUUM;"
	sqlite3 "$file_path" "$query" >/dev/null
	nsize=$(__cal_file_size "$file_path")
	diff=$(__cal_file_diff "$osize" "$nsize")

	echo "File size: $osize bytes => $nsize bytes | $diff"
}
_deploy_db() {
	local file_path="$TEMP_DIR/$DB_FILE"
	local dest="$DATA_DIR/$DB_FILE"
	mv -f "$file_path" "$dest"
	echo "Placed: $dest"
}

__cal_file_size() {
	read -r size _ < <(wc -c "$1")
	printf '%d' "$size"
}
__cal_file_diff() {
	local osize="$1" nsize="$2"
	local diff percent
	diff=$((osize - nsize))
	percent=$(echo "scale=2; $diff / $osize * 100" | bc)
	printf '%d bytes (%s%%)' "$diff" "$percent"
}

trap cleanup EXIT
main
