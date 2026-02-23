import type { SQLiteTransaction } from '$lib/source/sqlite/models'
import type { ParsedTransaction } from '$lib/transactions/models'
import { classifySQLiteTransaction } from '$lib/transactions/classifier'

export const mapSQLiteTransaction = (
	transaction: SQLiteTransaction
): ParsedTransaction => {
	return classifySQLiteTransaction(transaction)
}
