import type { AnyThemeMap } from './theme'

export type ToThemeNames<M extends AnyThemeMap> = keyof M extends string
	? keyof M
	: never
