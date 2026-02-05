import type { system, themeMap } from '../constants'
import type { ToThemeNames } from './helpers'
import type { Theme, ThemeSchema } from './theme'

export type ThemeNames = ToThemeNames<typeof themeMap>
export type ThemeSystem = (typeof system)['name']

export interface ParsedTheme {
	current: ThemeSystem | ThemeNames
	theme: Theme<ThemeSchema, string>
}
