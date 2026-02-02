import { MediaQuery } from 'svelte/reactivity'

import { themeMap } from './constants'

import { store } from '$lib/loggers'
import {
	newStore,
	localDBV1,
	STORE_STATE_THM_KEY_V1,
	type SchemaState,
	type StateNormal,
	type StoreSchema,
} from '$lib/stores'

type ThemeState = SchemaState<
	StoreSchema,
	'v1:app-db',
	typeof STORE_STATE_THM_KEY_V1,
	'default'
>

const resolveSystemTheme = () => {
	const mq = new MediaQuery('(prefers-color-scheme: dark)')
	return mq.current ? themeMap.dark : themeMap.light
}

export const initThemeStore = () => {
	const log = store.extends('theme')
	const empty: ThemeState = {
		current: 'system',
		theme: themeMap.light,
	}

	const normalize: StateNormal<ThemeState> = (state) => {
		const current = state?.current ?? 'system'
		const theme =
			current === 'system'
				? resolveSystemTheme()
				: (themeMap[current] ?? themeMap.light)
		return {
			current,
			theme,
		}
	}

	return newStore(localDBV1, empty, {
		getVal: (db) => db.get(STORE_STATE_THM_KEY_V1, 'default'),
		setVal: (db, state) => db.set(STORE_STATE_THM_KEY_V1, 'default', state),
		delVal: (db) => db.remove(STORE_STATE_THM_KEY_V1, 'default'),
		normalize,
		onChange: (store, _, data, event) => {
			if (data?.table === STORE_STATE_THM_KEY_V1 && data?.key === 'default') {
				store.update((current) => {
					if (data.value.current !== current.current) {
						console.log('theme changed:', event)
						return data.value
					}
					return current
				})
			}
		},
		log,
	})
}
