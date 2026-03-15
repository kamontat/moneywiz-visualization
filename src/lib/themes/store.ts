import type { ThemeState } from './state'
import type { State } from '$utils/states/models'
import { theme } from '$lib/loggers'
import { localstorage } from '$lib/providers/localstorage'
import { newStore, STATE_THEME_V1 } from '$utils/stores'

export const initThemeStore = (state: State<ThemeState>) => {
	const table = localstorage.table(STATE_THEME_V1)
	const log = theme.extends('store')

	const store = newStore(state, {
		available: () => localstorage.available(),
		get: () => table.get<ThemeState>('default'),
		set: (value) => table.set('default', value),
		del: () => table.delete('default'),
		log,
	})

	if (localstorage.available()) {
		table.onChange<ThemeState>('default', (value) => {
			if (value) {
				log.debug('theme changed:', value)
				store.update(() => value)
			}
		})
	}

	return store
}
