import type { KcNtModeState } from './state'
import type { State } from '$utils/states/models'
import { analytic } from '$lib/loggers'
import { localstorage } from '$lib/providers/localstorage'
import { newStore, STATE_KCNT_MODE_V1 } from '$utils/stores'

export const initKcNtModeStore = (state: State<KcNtModeState>) => {
	const table = localstorage.table(STATE_KCNT_MODE_V1)
	const log = analytic.extends('kcnt.store')

	const store = newStore(state, {
		available: () => localstorage.available(),
		get: () => table.get<KcNtModeState>('default'),
		set: (value) => table.set('default', value),
		del: () => table.delete('default'),
		log,
	})

	if (localstorage.available()) {
		table.onChange<KcNtModeState>('default', (value) => {
			store.update(() => value ?? { enabled: false })
		})
	}

	return store
}
