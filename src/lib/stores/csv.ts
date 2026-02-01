import { indexDBV1 } from './db'
import {
	newStore,
	STORE_STATE_CSV_KEY_V1,
	STORE_STATE_THM_KEY_V1,
	type SchemaState,
	type StateNormal,
	type StoreSchema,
} from './internal'

import { store } from '$lib/loggers'

type CsvState = SchemaState<
	StoreSchema,
	'v1:app-db',
	typeof STORE_STATE_CSV_KEY_V1,
	'default'
>

export const initCsvStore = () => {
	const log = store.extends('csv')
	const empty: CsvState = {
		fileName: null,
		headers: [],
		rows: [],
	}

	const normalize: StateNormal<CsvState> = (state) => {
		return {
			fileName: state?.fileName ?? null,
			headers: state?.headers ?? [],
			rows: state?.rows ?? [],
		}
	}

	return newStore(indexDBV1, empty, {
		normalize,
		getVal: (db) => db.get(STORE_STATE_CSV_KEY_V1, 'default'),
		setVal: async (db, state) => {
			await db.put(STORE_STATE_CSV_KEY_V1, state, 'default')
			db.trigger(STORE_STATE_CSV_KEY_V1, 'default', state)
		},
		delVal: (db) => db.delete(STORE_STATE_CSV_KEY_V1, 'default'),
		log,
	})
}
