import type { SvelteHTMLElements } from 'svelte/elements'
import type { TagName } from './types'

/** Element props without 'class' */
export type ElementProps<T extends TagName> = Omit<
	SvelteHTMLElements[T],
	'class' | 'children'
>

/** Element props with optional 'tag' */
export type ElementTagProps<T extends TagName> = SvelteHTMLElements[T] & {
	tag?: T
}
