import type { Theme } from './models'
import { newTheme, newThemeMap } from './utils'

export const system = {
	label: 'System' as const,
	name: 'system' as const,
} as Theme<'light' | 'dark', 'system'>

export const themeMap = newThemeMap(
	newTheme('Light', 'light', 'light'),
	newTheme('Dark', 'dark', 'dark'),
	newTheme('Cupcake', 'light', 'cupcake'),
	newTheme('Retro', 'light', 'retro'),
	newTheme('Valentine', 'light', 'valentine'),
	newTheme('Pastel', 'light', 'pastel'),
	newTheme('Black', 'dark', 'black'),
	newTheme('Dracula', 'dark', 'dracula'),
	newTheme('Dim', 'dark', 'dim')
)

/** For <select> options */
export const themeList = [system, ...Object.values(themeMap)].map((t) => ({
	label: t.label,
	value: t.name,
}))
