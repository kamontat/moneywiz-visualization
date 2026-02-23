import type { Database, Sqlite3Static } from '@sqlite.org/sqlite-wasm'
import { openDatabase } from '$lib/source/sqlite/worker/runtime'

export const openSnapshotDatabase = async (
	sqlite3: Sqlite3Static,
	file: File
): Promise<Database> => {
	const buffer = await file.arrayBuffer()
	return openDatabase(sqlite3, buffer)
}
