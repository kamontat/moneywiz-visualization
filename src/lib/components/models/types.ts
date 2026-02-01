import type { Snippet } from 'svelte'
import type { ClassValue, SvelteHTMLElements } from 'svelte/elements'

export type Children = Snippet

export type ClassName = ClassValue
export type ClassArray = Extract<ClassValue, Array<unknown>>
export type ClassArrayString = string[]
export type ClassDict = Record<string, boolean | null | undefined>

export type TagName = keyof SvelteHTMLElements
