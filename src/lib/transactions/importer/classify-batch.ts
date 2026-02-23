import type { SQLiteTransaction } from '$lib/source/sqlite/models'
import type { ParsedTransaction } from '$lib/transactions/models'
import {
	shouldSkipParsedTransaction,
	shouldSkipSQLiteTransaction,
} from './filter-rules'
import { mapSQLiteTransaction } from './map-transaction'

export const classifySQLiteBatch = (
	batch: SQLiteTransaction[]
): ParsedTransaction[] => {
	const output: ParsedTransaction[] = []

	for (const sqliteTransaction of batch) {
		if (shouldSkipSQLiteTransaction(sqliteTransaction)) continue

		const parsed = mapSQLiteTransaction(sqliteTransaction)
		if (shouldSkipParsedTransaction(parsed)) continue
		output.push(parsed)
	}

	return output
}
