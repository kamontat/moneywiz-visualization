export type ThemeSchema = 'light' | 'dark'

export interface Theme<S extends ThemeSchema, N extends string> {
	label: string
	schema: S
	name: N
}
export type AnyTheme = Theme<ThemeSchema, string>

export type ThemeMap<M extends Theme<ThemeSchema, string>[]> = {
	[K in M[number]['name']]: Extract<M[number], { name: K }>
}
export type AnyThemeMap = ThemeMap<AnyTheme[]>

export type ToThemeNames<M extends AnyThemeMap> = keyof M extends string
	? keyof M
	: never
