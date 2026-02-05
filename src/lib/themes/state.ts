import type { GetSchemaValue } from '$utils/db/models'
import type { StateNormalizeFn } from '$utils/states/models'
import type { STORE_STATE_THM_KEY_V1 } from '$utils/stores'
import type { StoreSchema } from '$utils/stores/models'
import { MediaQuery } from 'svelte/reactivity'

import { themeMap } from './constants'

import { newEmptyState, newState } from '$utils/states'

export type ThemeState = GetSchemaValue<
	StoreSchema['v1:app-db'],
	typeof STORE_STATE_THM_KEY_V1,
	'default'
>

const resolveSystemTheme = () => {
	const mq = new MediaQuery('(prefers-color-scheme: dark)')
	return mq.current ? themeMap.dark : themeMap.light
}

const normalize: StateNormalizeFn<ThemeState> = (state) => {
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

export const initThemeState = () => {
	const empty = newEmptyState<ThemeState>({
		current: 'system',
		theme: themeMap.light,
	})
	return newState(empty, {
		normalize,
		equal: (a, b) => a.theme === b.theme,
	})
}
