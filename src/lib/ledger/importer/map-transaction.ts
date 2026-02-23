import type { ParsedTransaction } from '$lib/ledger/models'
import type { SQLiteTransaction } from '$lib/source/sqlite/models'
import { classifySQLiteTransaction } from '$lib/ledger/classifier'

export const mapSQLiteTransaction = (
	transaction: SQLiteTransaction
): ParsedTransaction => {
	return classifySQLiteTransaction(transaction)
}
