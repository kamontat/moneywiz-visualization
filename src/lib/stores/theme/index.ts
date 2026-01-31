import type { StoreFactory, StoreState } from '../models'
import type { ThemeSchema, ToThemeNames } from './models'
import { MediaQuery } from 'svelte/reactivity'

import { STORE_STATE_THM_KEY } from '../constants'

import { themeMap } from './constants'

export type ThemeNames = ToThemeNames<typeof themeMap>
export type ThemeData = 'system' | ThemeNames
export type { ThemeSchema }

export interface StoreStateThm extends StoreState<typeof STORE_STATE_THM_KEY, ThemeData> {
	schema: ThemeSchema
	theme: ThemeNames
}

const resolveSystemTheme = () => {
	const mq = new MediaQuery('(prefers-color-scheme: dark)')
	return mq.current ? themeMap.dark.name : themeMap.light.name
}

export const themeFactory: StoreFactory<StoreStateThm> = {
	emptyState: {
		type: STORE_STATE_THM_KEY,
		data: 'system',
		schema: themeMap.light.schema,
		theme: themeMap.light.name,
	},
	normalize(value) {
		const data = value?.data ?? 'system'
		const theme = data === 'system' ? resolveSystemTheme() : data
		const schema = themeMap[theme].schema
		return {
			type: value?.type ?? STORE_STATE_THM_KEY,
			data,
			schema,
			theme,
		}
	},
}

export { themeMap }
