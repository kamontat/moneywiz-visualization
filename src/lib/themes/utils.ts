import type { Theme, ThemeMap, ThemeSchema } from './models'

export const newTheme = <S extends ThemeSchema, N extends string>(
	label: string,
	schema: S,
	name: N
): Theme<S, N> => ({
	label,
	schema,
	name,
})

export const newThemeMap = <M extends Theme<ThemeSchema, string>[]>(
	...map: M
): ThemeMap<M> => {
	return Object.fromEntries(
		map.map((theme) => [theme.name, theme])
	) as ThemeMap<M>
}
