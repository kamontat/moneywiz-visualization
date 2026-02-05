import type { GetSchemaValue } from '$utils/db/models'
import type { StateEqualFn, StateNormalizeFn } from '$utils/states/models'
import type { STATE_THEME_V1 } from '$utils/stores'
import type { StoreSchema } from '$utils/stores/models'
import { MediaQuery } from 'svelte/reactivity'

import { themeMap } from './constants'

import { newEmptyState, newState } from '$utils/states'

export type ThemeState = GetSchemaValue<
	StoreSchema['v1:app-db'],
	typeof STATE_THEME_V1,
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

const equal: StateEqualFn<ThemeState> = (a, b) => a.theme === b.theme

export const initThemeState = () => {
	const empty = newEmptyState<ThemeState>({
		current: 'system',
		theme: themeMap.light,
	})
	return newState(empty, {
		normalize,
		equal,
	})
}
