import type { Component, ComponentProps } from 'svelte'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyComponent = Component<any, any>

/** Component props with optional 'Component' */
export type ComponentTagProps<C extends AnyComponent> = ComponentProps<C> & {
	Component?: C
}

export type { ComponentProps }
