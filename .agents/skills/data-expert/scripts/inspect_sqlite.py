#!/usr/bin/env python3
"""Inspect SQLite schema and rows using a read-only connection."""

from __future__ import annotations

import argparse
import sqlite3
import sys
from pathlib import Path


def parse_args() -> argparse.Namespace:
	parser = argparse.ArgumentParser(
		description='Inspect SQLite schema and run read-only queries'
	)
	parser.add_argument(
		'--db',
		required=True,
		help='Path to SQLite file, for example data/ipadMoneyWiz.sqlite'
	)
	parser.add_argument(
		'--tables',
		action='store_true',
		help='List table names'
	)
	parser.add_argument(
		'--schema',
		help='Show schema for a table name'
	)
	parser.add_argument(
		'--query',
		help='Run a read-only SQL query and print rows'
	)
	parser.add_argument(
		'--limit',
		type=int,
		default=20,
		help='Maximum rows printed for --query (default: 20)'
	)
	return parser.parse_args()


def connect_read_only(db_path: Path) -> sqlite3.Connection:
	uri = f'file:{db_path.resolve()}?mode=ro'
	return sqlite3.connect(uri, uri=True)


def list_tables(conn: sqlite3.Connection) -> None:
	query = """
	SELECT name
	FROM sqlite_master
	WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
	ORDER BY name
	"""
	for (name,) in conn.execute(query):
		print(name)


def show_schema(conn: sqlite3.Connection, table: str) -> None:
	rows = conn.execute(f'PRAGMA table_info("{table}")').fetchall()
	if not rows:
		print(f'No schema found for table: {table}', file=sys.stderr)
		return
	for row in rows:
		cid, name, col_type, not_null, default, pk = row
		print(
			f'{cid:>3} | {name:<30} | {col_type:<12} '
			f'| not_null={not_null} | pk={pk} | default={default}'
		)


def run_query(conn: sqlite3.Connection, query: str, limit: int) -> None:
	normalized = query.strip().lower()
	if not normalized.startswith('select'):
		raise ValueError('Only SELECT queries are allowed')

	rows = conn.execute(query).fetchmany(limit)
	if not rows:
		print('(no rows)')
		return

	for row in rows:
		print(' | '.join('' if value is None else str(value) for value in row))


def main() -> int:
	args = parse_args()
	db_path = Path(args.db)

	if not db_path.exists():
		print(f'Database file not found: {db_path}', file=sys.stderr)
		return 1

	actions = [args.tables, bool(args.schema), bool(args.query)]
	if sum(1 for action in actions if action) != 1:
		print('Choose exactly one of --tables, --schema, or --query', file=sys.stderr)
		return 1

	try:
		with connect_read_only(db_path) as conn:
			if args.tables:
				list_tables(conn)
			elif args.schema:
				show_schema(conn, args.schema)
			else:
				run_query(conn, args.query, args.limit)
	except (sqlite3.Error, ValueError) as error:
		print(f'Error: {error}', file=sys.stderr)
		return 1

	return 0


if __name__ == '__main__':
	raise SystemExit(main())
