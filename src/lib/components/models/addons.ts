export interface VariantProps<V extends string> {
	/** When not provided, defaults to 'plain' */
	variant?: V
}

/** Custom props for components */
export type CustomProps<T> = T
