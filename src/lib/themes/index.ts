import type { Theme, ThemeSchema, ToThemeNames } from './models'
import { system, themeMap, themeList } from './constants'
import { initThemeState } from './state'
import { initThemeStore } from './store'

export const themeState = initThemeState()
export const themeStore = initThemeStore(themeState)
export { system, themeMap, themeList }

export type ThemeNames = ToThemeNames<typeof themeMap>
export type ThemeSystem = (typeof system)['name']
export type { ThemeSchema }

export interface ParsedTheme {
	current: ThemeSystem | ThemeNames
	theme: Theme<ThemeSchema, string>
}
