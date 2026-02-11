#!/usr/bin/env bash
set -euo pipefail

base_ref="${1:-origin/main}"
if ! git rev-parse --verify "$base_ref" >/dev/null 2>&1; then
	base_ref="HEAD~1"
fi

changed_files="$(git diff --name-only "$base_ref"...HEAD)"
if [ -z "$changed_files" ]; then
	echo "No changed files found between $base_ref and HEAD"
	exit 0
fi

src_changes="$(printf '%s\n' "$changed_files" | rg '^src/' || true)"
test_changes="$(
	printf '%s\n' "$changed_files" | rg '(\.spec\.ts$|\.svelte\.spec\.ts$)' || true
)"

echo "Base ref: $base_ref"
echo "Changed files:"
printf '%s\n' "$changed_files"
echo

if [ -z "$src_changes" ]; then
	echo "No source changes under src/."
	exit 0
fi

if [ -n "$test_changes" ]; then
	echo "Detected test file changes:"
	printf '%s\n' "$test_changes"
	echo "Automation coverage likely updated."
	exit 0
fi

echo "WARNING: Source files changed but no test files changed."
echo "Verify existing tests cover new behavior, or add tests before merge."
exit 0
