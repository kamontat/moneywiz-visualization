import type { ThemeState } from './state'
import type { State } from '$utils/states/models'
import { theme } from '$lib/loggers'
import { localDBV1, newStore, STORE_STATE_THM_KEY_V1 } from '$utils/stores'

export const initThemeStore = (state: State<ThemeState>) => {
	const db = localDBV1
	const log = theme.extends('store')

	const store = newStore(db, state, {
		get: (db) => db.get(STORE_STATE_THM_KEY_V1, 'default'),
		set: (db, state) => db.set(STORE_STATE_THM_KEY_V1, 'default', state),
		del: (db) => db.delete(STORE_STATE_THM_KEY_V1, 'default'),
		trg: (db, act, v) => db.trigger(act, STORE_STATE_THM_KEY_V1, 'default', v),
		log,
	})

	if (db.available()) {
		db.onChangeByKey(STORE_STATE_THM_KEY_V1, 'default', async (_, data) => {
			const value = await data?.read()
			if (value) {
				log.debug('theme changed:', value)
				store.update(() => value)
			}
		})
	}

	return store
}
