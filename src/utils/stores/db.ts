import type { StoreSchema } from './models'
import {
	STORE_STATE_CSV_KEY_V1,
	STORE_STATE_THM_KEY_V1,
	STORE_STATE_TRX_KEY_V1,
} from './constants'

import { IndexDB, LocalDB } from '$utils/db'

export const localDBV1 = LocalDB.create<StoreSchema>('v1:app-db')
export const indexDBV1 = IndexDB.create<StoreSchema>('v1:app-db', {
	upgrade(database) {
		database.createObjectStore(STORE_STATE_THM_KEY_V1)
		database.createObjectStore(STORE_STATE_CSV_KEY_V1)
		const trx = database.createObjectStore(STORE_STATE_TRX_KEY_V1)
		trx.createIndex('date', 'date', { unique: false })
		trx.createIndex('type', 'type', { unique: false })

		// db.createObjectStore(STORE_STATE_FLT_KEY_V1)
	},
})
