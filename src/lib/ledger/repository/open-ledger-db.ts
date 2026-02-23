import type { LedgerDBSchema } from '$lib/ledger/models'
import { openDB, type IDBPDatabase } from 'idb'

import {
	LEDGER_DB_NAME,
	LEDGER_DB_VERSION,
	STORE_LEDGER_META_V2,
	STORE_LEDGER_TRANSACTIONS_V2,
	STORE_SESSION_MANIFEST_V2,
} from '$lib/ledger/models'

export const openLedgerDB = async (): Promise<IDBPDatabase<LedgerDBSchema>> => {
	return openDB<LedgerDBSchema>(LEDGER_DB_NAME, LEDGER_DB_VERSION, {
		upgrade(database) {
			if (!database.objectStoreNames.contains(STORE_SESSION_MANIFEST_V2)) {
				database.createObjectStore(STORE_SESSION_MANIFEST_V2, {
					keyPath: 'key',
				})
			}

			if (!database.objectStoreNames.contains(STORE_LEDGER_META_V2)) {
				database.createObjectStore(STORE_LEDGER_META_V2, {
					keyPath: 'key',
				})
			}

			if (!database.objectStoreNames.contains(STORE_LEDGER_TRANSACTIONS_V2)) {
				const store = database.createObjectStore(STORE_LEDGER_TRANSACTIONS_V2, {
					keyPath: 'id',
					autoIncrement: true,
				})
				store.createIndex('date', 'date', { unique: false })
				store.createIndex('type', 'type', { unique: false })
				store.createIndex('account', ['account.name'], { unique: false })
			}
		},
	})
}
