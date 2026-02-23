import type { ParsedTransaction } from '$lib/transactions/models'
import { openLedgerDB } from './open-ledger-db'

import { STORE_LEDGER_TRANSACTIONS_V2 } from '$lib/transactions/models'

export const getLedgerTransactionCount = async (): Promise<number> => {
	const database = await openLedgerDB()
	try {
		const transaction = database.transaction(STORE_LEDGER_TRANSACTIONS_V2)
		const count = await transaction.store.count()
		await transaction.done
		return count
	} finally {
		database.close()
	}
}

export const getLedgerTransactions = async (
	limit?: number
): Promise<ParsedTransaction[]> => {
	const database = await openLedgerDB()
	try {
		const transaction = database.transaction(STORE_LEDGER_TRANSACTIONS_V2)
		const items = await transaction.store.getAll(undefined, limit)
		await transaction.done
		return items as ParsedTransaction[]
	} finally {
		database.close()
	}
}

export const putLedgerTransactionBatch = async (
	items: ParsedTransaction[]
): Promise<void> => {
	if (items.length === 0) return

	const database = await openLedgerDB()
	try {
		const transaction = database.transaction(
			STORE_LEDGER_TRANSACTIONS_V2,
			'readwrite'
		)
		for (const item of items) {
			await transaction.store.put(item)
		}
		await transaction.done
	} finally {
		database.close()
	}
}

export const clearLedgerTransactions = async (): Promise<void> => {
	const database = await openLedgerDB()
	try {
		const transaction = database.transaction(
			STORE_LEDGER_TRANSACTIONS_V2,
			'readwrite'
		)
		await transaction.store.clear()
		await transaction.done
	} finally {
		database.close()
	}
}
