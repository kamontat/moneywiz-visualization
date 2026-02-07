import type { StoreSchema } from './models'
import {
	STATE_CSV_RAW_HEAD_V1,
	STATE_CSV_RAW_ROWS_V1,
	STATE_TRX_V1,
	STORE_DB_V1,
} from './constants'

import { IndexDB, LocalDB } from '$utils/db'

export const localDBV1 = LocalDB.create<StoreSchema>(STORE_DB_V1)
export const indexDBV1 = IndexDB.create<StoreSchema>(STORE_DB_V1, {
	upgrade(database) {
		database.createObjectStore(STATE_CSV_RAW_ROWS_V1, {
			autoIncrement: true,
		})
		database.createObjectStore(STATE_CSV_RAW_HEAD_V1, {
			autoIncrement: true,
		})

		const trxStore = database.createObjectStore(STATE_TRX_V1, {
			keyPath: 'id',
			autoIncrement: true,
		})
		trxStore.createIndex('date', 'date', { unique: false })
		trxStore.createIndex('type', 'type', { unique: false })
		trxStore.createIndex('account', ['account.name'], { unique: false })
	},
})
