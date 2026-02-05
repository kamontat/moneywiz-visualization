import type { ThemeState } from './state'
import type { State } from '$utils/states/models'
import { theme } from '$lib/loggers'
import { localDBV1, newStore, STATE_THEME_V1 } from '$utils/stores'

export const initThemeStore = (state: State<ThemeState>) => {
	const db = localDBV1
	const log = theme.extends('store')

	const store = newStore(db, state, {
		get: (db) => db.get(STATE_THEME_V1, 'default'),
		set: (db, state) => {
			db.set(STATE_THEME_V1, 'default', state)
			db.trigger('set', STATE_THEME_V1, 'default', state.theme.name)
		},
		del: (db) => {
			db.delete(STATE_THEME_V1, 'default')
			db.trigger('delete', STATE_THEME_V1, 'default', '')
		},
		log,
	})

	if (db.available()) {
		db.onChangeByKey(STATE_THEME_V1, 'default', async (_, data) => {
			const value = await data?.read()
			if (value) {
				log.debug('theme changed:', value)
				store.update(() => value)
			}
		})
	}

	return store
}
