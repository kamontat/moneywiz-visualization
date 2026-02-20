import type { DatabaseState } from './state'
import type { State } from '$utils/states/models'
import { database } from '$lib/loggers'
import { localDBV1, newStore, STATE_DB_V1 } from '$utils/stores'

export const initDatabaseStore = (state: State<DatabaseState>) => {
	const db = localDBV1
	const log = database.extends('store')

	return newStore(db, state, {
		get: (db) => db.get(STATE_DB_V1, 'default'),
		set: (db, state) => {
			db.set(STATE_DB_V1, 'default', state)
			db.trigger(
				'set',
				STATE_DB_V1,
				'default',
				state ? (state.fileName ?? '') : ''
			)
		},
		del: (db) => {
			db.delete(STATE_DB_V1, 'default')
			db.trigger('delete', STATE_DB_V1, 'default', '')
		},
		log,
	})
}
