import { openLedgerDB } from './open-ledger-db'

import { STORE_LEDGER_META_V2 } from '$lib/transactions/models'

export const getLedgerMetaRecords = async (): Promise<
	Array<{ key: string; value: unknown }>
> => {
	const database = await openLedgerDB()
	try {
		const transaction = database.transaction(STORE_LEDGER_META_V2)
		const rows = await transaction.store.getAll()
		await transaction.done
		return rows.map((row) => ({
			key: row.key,
			value: row.value,
		}))
	} finally {
		database.close()
	}
}
