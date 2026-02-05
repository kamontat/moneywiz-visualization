import type { CsvState } from './state'
import type { State } from '$utils/states/models'
import { csv } from '$lib/loggers'
import { localDBV1, newStore, STATE_CSV_V1 } from '$utils/stores'

export const initCsvStore = (state: State<CsvState>) => {
	const db = localDBV1
	const log = csv.extends('store')

	return newStore(db, state, {
		get: (db) => db.get(STATE_CSV_V1, 'default'),
		set: (db, state) => {
			db.set(STATE_CSV_V1, 'default', state)
			db.trigger(
				'set',
				STATE_CSV_V1,
				'default',
				state ? (state.fileName ?? '') : ''
			)
		},
		del: (db) => {
			db.delete(STATE_CSV_V1, 'default')
			db.trigger('delete', STATE_CSV_V1, 'default', '')
		},
		log,
	})
}
