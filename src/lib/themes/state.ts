import type { ParsedTheme } from './models'
import type { StateEqualFn, StateNormalizeFn } from '$utils/states/models'
import { MediaQuery } from 'svelte/reactivity'

import { themeMap } from './constants'

import { newEmptyState, newState } from '$utils/states'

export type ThemeState = ParsedTheme

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
