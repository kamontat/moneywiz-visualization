import type { FilterOptions } from './models'
import type { State } from '$utils/states/models'
import { analytic } from '$lib/loggers'
import { localDBV1, newStore, STATE_FILTER_OPTIONS_V1 } from '$utils/stores'

export const initFilterOptionsStore = (
	state: State<FilterOptions | undefined>
) => {
	const db = localDBV1
	const log = analytic.extends('filters.store')

	const store = newStore(db, state, {
		get: (db) => db.get(STATE_FILTER_OPTIONS_V1, 'default'),
		set: (db, value) => {
			db.set(STATE_FILTER_OPTIONS_V1, 'default', value)
			db.trigger(
				'set',
				STATE_FILTER_OPTIONS_V1,
				'default',
				value?.fileName ?? ''
			)
		},
		del: (db) => {
			db.delete(STATE_FILTER_OPTIONS_V1, 'default')
			db.trigger('delete', STATE_FILTER_OPTIONS_V1, 'default', '')
		},
		log,
	})

	if (db.available()) {
		db.onChangeByKey(STATE_FILTER_OPTIONS_V1, 'default', async (_, data) => {
			const value = await data?.read()
			store.update(() => value)
		})
	}

	return store
}
