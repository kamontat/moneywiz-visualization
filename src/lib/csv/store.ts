import { store } from '$lib/loggers'
import {
	newStore,
	STORE_STATE_CSV_KEY_V1,
	indexDBV1,
	type SchemaState,
	type StateNormal,
	type StoreSchema,
} from '$lib/stores'

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
		setVal: async (db, state) =>
			db.set(STORE_STATE_CSV_KEY_V1, 'default', state),
		delVal: (db) => db.remove(STORE_STATE_CSV_KEY_V1, 'default'),
		log,
	})
}
