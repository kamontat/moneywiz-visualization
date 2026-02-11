#!/usr/bin/env bash
set -euo pipefail

if ! command -v bun >/dev/null 2>&1; then
	echo "bun is required but not found in PATH"
	exit 1
fi

echo "[1/4] bun run fix"
bun run fix

echo "[2/4] bun run check"
bun run check

echo "[3/4] bun run build"
bun run build

echo "[4/4] bun run test:unit"
bun run test:unit

echo "Quality gate passed (E2E is intentionally manual)"
