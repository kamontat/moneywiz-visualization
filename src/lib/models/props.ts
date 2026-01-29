import type { ComponentProps, Snippet } from 'svelte'
import type { ClassValue, SvelteHTMLElements } from 'svelte/elements'

export type Children = Snippet
export type ClassName = ClassValue
export type TagName = keyof SvelteHTMLElements

export interface BaseProps {
	children?: Children
	class?: ClassName
}

export type CustomProps<T> = T

export type ElementProps<T extends TagName> = SvelteHTMLElements[T] & {
	tag?: T
}

export type { ComponentProps }
