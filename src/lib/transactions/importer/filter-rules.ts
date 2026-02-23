import type { SQLiteTransaction } from '$lib/source/sqlite/models'
import type { ParsedTransaction } from '$lib/transactions/models'
import { SQLITE_ENTITY_ID } from '$lib/source/sqlite/models'
import {
	isIncompleteIncomeOrExpense,
	isNewBalanceDescription,
} from '$lib/transactions/utils'

export const shouldSkipSQLiteTransaction = (
	transaction: SQLiteTransaction
): boolean => {
	return (
		transaction.entityId !== SQLITE_ENTITY_ID.ReconcileTransaction &&
		transaction.categories.length === 0 &&
		isNewBalanceDescription(transaction.description)
	)
}

export const shouldSkipParsedTransaction = (
	transaction: ParsedTransaction
): boolean => {
	return isIncompleteIncomeOrExpense(transaction)
}
