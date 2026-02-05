import type { StoreSchema } from './models'
import { STATE_CSV_RAW_HEAD_V1, STATE_CSV_RAW_ROWS_V1 } from './constants'

import { IndexDB, LocalDB } from '$utils/db'

export const localDBV1 = LocalDB.create<StoreSchema>('v1:app-db')
export const indexDBV1 = IndexDB.create<StoreSchema>('v1:app-db', {
	upgrade(database) {
		// database.createObjectStore(STATE_THEME_V1)
		// database.createObjectStore(STATE_CSV_V1)

		database.createObjectStore(STATE_CSV_RAW_ROWS_V1, {
			autoIncrement: true,
		})
		database.createObjectStore(STATE_CSV_RAW_HEAD_V1, {
			autoIncrement: true,
		})

		// const trx = database.createObjectStore(STATE_TRX_V1)
		// trx.createIndex('date', 'date', { unique: false })
		// trx.createIndex('type', 'type', { unique: false })

		// db.createObjectStore(STATE_FILTER_V1)
	},
})
