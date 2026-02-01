import type { Theme, ThemeSchema, ToThemeNames } from './models'
import { system, themeMap, themeList } from './constants'

export { system, themeMap, themeList }

export type ThemeNames = ToThemeNames<typeof themeMap>
export type ThemeSystem = (typeof system)['name']
export type { ThemeSchema }

export interface ParsedTheme {
	current: ThemeSystem | ThemeNames
	theme: Theme<ThemeSchema, string>
}
