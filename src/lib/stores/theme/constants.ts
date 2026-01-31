import { newTheme, newThemeMap } from './utils'

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
