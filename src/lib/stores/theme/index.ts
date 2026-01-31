import type { StoreFactory, StoreState } from '../models'
import { MediaQuery } from 'svelte/reactivity'

import { STORE_STATE_THM_KEY } from '../constants'

export type ThemeName = 'light' | 'dark' | 'cupcake'
export type ThemeData = 'system' | ThemeName

export interface StoreStateThm extends StoreState<typeof STORE_STATE_THM_KEY, ThemeData> {
	theme: ThemeName
}

const resolveSystemTheme = (): ThemeName => {
	const mq = new MediaQuery('(prefers-color-scheme: dark)')
	return mq.current ? 'dark' : 'light'
}

export const themeFactory: StoreFactory<StoreStateThm> = {
	emptyState: {
		type: STORE_STATE_THM_KEY,
		data: 'system',
		theme: 'light',
	},
	normalize(value) {
		const data = value?.data ?? 'system'
		const theme = data === 'system' ? resolveSystemTheme() : data
		return {
			type: value?.type ?? STORE_STATE_THM_KEY,
			data,
			theme,
		}
	},
}
