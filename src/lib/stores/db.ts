import type { ToIDBSchema } from '$lib/db/models'
import {
	STORE_STATE_CSV_KEY_V1,
	STORE_STATE_THM_KEY_V1,
	STORE_STATE_TRX_KEY_V1,
	type StoreSchema,
} from './internal'

import { IndexDB, LocalDB } from '$lib/db'

type DBSchema = ToIDBSchema<StoreSchema['v1:app-db']>

export const localDBV1 = LocalDB.create('v1:app-db')
export const indexDBV1 = IndexDB.create<DBSchema>('v1:app-db', {
	upgrade(db) {
		db.createObjectStore(STORE_STATE_THM_KEY_V1)
		db.createObjectStore(STORE_STATE_CSV_KEY_V1)
		const trx = db.createObjectStore(STORE_STATE_TRX_KEY_V1)
		trx.createIndex('date', 'date', { unique: false })
		trx.createIndex('type', 'type', { unique: false })

		// db.createObjectStore(STORE_STATE_FLT_KEY_V1)
	},
})
