import type { FilterOptions } from './models'
import type { State } from '$utils/states/models'
import { analytic } from '$lib/loggers'
import { localstorage } from '$lib/providers/localstorage'
import { newStore, STATE_FILTER_OPTIONS_V1 } from '$utils/stores'

export const initFilterOptionsStore = (
	state: State<FilterOptions | undefined>
) => {
	const table = localstorage.table(STATE_FILTER_OPTIONS_V1)
	const log = analytic.extends('filters.store')

	const store = newStore(state, {
		available: () => localstorage.available(),
		get: () => table.get<FilterOptions | undefined>('default'),
		set: (value) => table.set('default', value),
		del: () => table.delete('default'),
		log,
	})

	if (localstorage.available()) {
		table.onChange<FilterOptions | undefined>('default', (value) => {
			store.update(() => value)
		})
	}

	return store
}
